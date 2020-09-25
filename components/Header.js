import Link from "next/link";
import { TOMATO, DARK_BLUE_TOMATO, DARK_GRAY } from "../color";

export default function Header() {
  return (
    <>
      <style jsx>
        {`
          .nav {
            height: 80px;
            font-size: 1.3rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid ${DARK_GRAY};
          }
          a {
            text-decoration: none;
            color: ${TOMATO};
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
