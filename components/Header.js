import Link from "next/link";
import { TOMATO, DARK_BLUE_TOMATO } from "../color";

export default function Header() {
  return (
    <>
      <style jsx>
        {`
          .nav {
            background: ${TOMATO};
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
          }
          a {
            text-decoration: none;
            color: ${'black'};
          }
        `}
      </style>
      <header className="header">
        <nav className="nav">
          <Link href="/">
            <a>My Blog</a>
          </Link>
          <Link href="/about">
            <a>About</a>
          </Link>
        </nav>
      </header>
    </>
  );
}
