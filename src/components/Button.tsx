type Props = {
  children: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const MyButton: React.FC<Props> = ({
  children,
  ...rest
}: Props): React.ReactElement => {
  return (
    <button
      className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors duration-300 uppercase"
      {...rest}
    >
      {children}
    </button>
  );
};

export default MyButton;
