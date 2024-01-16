import { getExplorerUrl } from "@/utils/network";
import Link from "next/link";
import { GoLinkExternal } from "react-icons/go";

type Props = {
  txHash: string;
  message: string;
};

const TxSubmitted: React.FC<Props> = ({ txHash, message }) => {
  const url = getExplorerUrl(txHash);
  return (
    <div className="flex flex-col">
      <span>{message}</span>
      <Link
        className="text-green-300 flex items-center gap-2"
        href={url}
        target="_blank"
      >
        <GoLinkExternal />
        View on explorer
      </Link>
    </div>
  );
};

export default TxSubmitted;
