import { authorizationCode } from "../flows/authorizationCode";
import Walkthrough from "./Walkthrough";

// ::flowchart{flow="authorization-code"} in Markdown.
const FLOWS = { "authorization-code": authorizationCode };

export default function FlowChart({ flow }) {
  const data = FLOWS[flow];
  if (!data) return null;
  return (
    <figure className="fc-figure" aria-label={`Interactive flow chart: ${data.title}`}>
      <Walkthrough flow={data} />
    </figure>
  );
}
