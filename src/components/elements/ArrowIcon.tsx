import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import clsx from 'clsx';

type ArrowIconProps = {
    direction: 'left' | 'right' | 'up' | 'down';
    disabled: boolean;
    styling?: string;
    onClick?: () => void;
};

const ArrowIcon = (props: ArrowIconProps) => {
    const customStyling = clsx(
        props.styling ? props.styling : 'text-gray-500 cursor-pointer w-4 h-4',
        props.direction === 'left' && '',
        props.direction === 'right' && 'rotate-180',
        props.direction === 'up' && 'rotate-90',
        props.direction === 'down' && '-rotate-90'
    );

    return <MdKeyboardArrowLeft className={customStyling} />;
};

export default ArrowIcon;
