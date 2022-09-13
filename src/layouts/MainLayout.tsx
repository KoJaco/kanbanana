import React from 'react';

type MainLayoutProps = {
    children: JSX.Element;
};

const MainLayout = ({ children }: MainLayoutProps) => {
    return <div>{children}</div>;
};

export default MainLayout;
