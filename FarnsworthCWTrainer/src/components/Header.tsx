import { IconGraphic } from '@static/shared';
import homeIcon from '@static/shared/assets/home.svg?raw';

export const Header = () => {
    const base = import.meta.env.BASE_URL ?? "/";
    const appIcon = `${base}key.svg`;

    return (
        <div className="header-row">
            <div className="header-title-group">
                <a href="https://neilhan.github.io/static" className="btn-icon home-link" title="Back to Home">
                    <IconGraphic 
                        svgMarkup={homeIcon}
                        size="lg"
                        className="home-link__icon"
                        title="Home"
                    />
                </a>
                <span className="breadcrumb-separator">/</span>
                <img 
                    src={appIcon}
                    alt="Morse key icon"
                    width="32"
                    height="32"
                    className="header-app-icon"
                />
                <h1>A Visual Farnsworth CW Trainer</h1>
            </div>
            <div className="header-links">
                <a href="#about">About</a>
                <a href="#help">Help</a>
            </div>
        </div>
    );
};

