import homeIcon from '@static/shared/assets/home.svg';

export const Header = () => {
    return (
        <div className="header-row">
            <div className="header-title-group">
                <a href="https://neilhan.github.io/static" className="btn-icon home-link" title="Back to Home">
                    <img src={homeIcon} alt="Home" width="24" height="24" />
                </a>
                <span className="breadcrumb-separator">/</span>
                <h1>A Visual Farnsworth CW Trainer</h1>
            </div>
            <div className="header-links">
                <a href="#about">About</a>
                <a href="#help">Help</a>
            </div>
        </div>
    );
};

