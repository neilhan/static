import React, { ReactNode } from 'react';

type LayoutProps = {
    header: ReactNode;
    footer: ReactNode;
    children: ReactNode;
};

export const Layout = ({ header, footer, children }: LayoutProps): React.ReactElement => (
    <div className="app-shell" id="top">
        <div className="app-shell__content">
            <header className="app-shell__header">
                {header}
            </header>
            <main className="app-shell__main">
                {children}
            </main>
            <footer className="app-shell__footer">
                {footer}
            </footer>
        </div>
    </div>
);


