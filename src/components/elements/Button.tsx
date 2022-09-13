type ButtonProps = {
    backgroundColor: string;
    buttonStyling?: string;
    onClick?: () => void;
    children?: JSX.Element;
};

const Button = (props: ButtonProps) => {
    // dummy variable as of now, will come from contextProvider.
    const currentThemeColor = '#fff';

    // Simple, headless button component
    const customButtonStyles = props.buttonStyling
        ? props.buttonStyling
        : 'p-2 w-full rounded-lg text-md border bg-gray-50 shadow dark:bg-slate-900 hover:scale-105 hover:drop-shadow-lg transition-transform duration-300';

    return (
        <button
            className={customButtonStyles}
            onClick={props.onClick}
            // Will come from contextProvider.
            style={{ backgroundColor: props.backgroundColor }}
        >
            {props.children}
        </button>
    );
};

export default Button;
