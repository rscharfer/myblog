// `npm run dev`: reuse a dev server already running for this project, else start one on port 3000.
import { execFileSync, spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT = process.env.PORT || '3000'

const run = (cmd, args) => {
  try {
    return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch (e) {
    return e.stdout?.toString() || '' // lsof exits 1 when nothing matches
  }
}

// Every listening TCP socket: [pid, port]
function listeners() {
  const out = run('lsof', ['-iTCP', '-sTCP:LISTEN', '-P', '-n', '-Fpn'])
  const found = []
  let pid
  for (const line of out.split('\n')) {
    if (line[0] === 'p') pid = line.slice(1)
    else if (line[0] === 'n') {
      const port = line.match(/:(\d+)$/)?.[1]
      if (pid && port) found.push([pid, port])
    }
  }
  return found
}

const cwdOf = (pid) => run('lsof', ['-a', '-p', pid, '-d', 'cwd', '-Fn']).match(/^n(.+)$/m)?.[1]

// The public port belongs to Next's router worker; its internal helper ports are noise.
const cmdOf = (pid) => run('ps', ['-o', 'command=', '-p', pid]).trim()
const mine = listeners().filter(
  ([pid]) => cmdOf(pid).startsWith('next-router-worker') && cwdOf(pid) === root
)
if (mine.length) {
  const ports = [...new Set(mine.map(([, port]) => port))]
  console.log(`A dev server for this project is already running:\n`)
  for (const p of ports) console.log(`  http://localhost:${p}`)
  console.log(`\n(pid ${[...new Set(mine.map(([pid]) => pid))].join(', ')}; stop it with: kill <pid>)`)
  process.exit(0)
}

if (listeners().some(([, port]) => port === PORT)) {
  console.error(`Port ${PORT} is in use by another program, not this project's dev server.`)
  console.error(`Free it (lsof -iTCP:${PORT} -sTCP:LISTEN) or run: PORT=3001 npm run dev`)
  process.exit(1)
}

// Explicit -p makes Next fail instead of silently picking another port.
const child = spawn('npx', ['next', 'dev', '-p', PORT], { cwd: root, stdio: 'inherit' })
child.on('exit', (code) => process.exit(code ?? 0))
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig))
