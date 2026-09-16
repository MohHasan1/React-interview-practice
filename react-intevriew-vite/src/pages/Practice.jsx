import { Link } from "react-router-dom";

export default function Practice() {
  return (
    <>
      <h1>Practice questions</h1>
      <ul>
        <li>
          <Link to="/practice/child-to-parent">
            Pass state from child to parent
          </Link>
        </li>
      </ul>
    </>
  );
}
