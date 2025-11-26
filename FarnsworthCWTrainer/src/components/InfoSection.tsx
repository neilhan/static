export const InfoSection = () => {
    return (
        <div className="explainer">
            <a id="about"></a>
            <h2>About</h2>
            <p>Visual reinforcement by displaying the character currently being sent. It is my hope that this will help form a stronger link between the <em>sound</em> of CW and the <em>meaning</em> of the sound.</p>

            <a href="#top">Top</a>

            <a id="help"></a>
            <h2>Help</h2>
            <dl>
                <dt>New Text</dt>
                <dd>Generate a new practice text based on current settings</dd>

                <dt>Send</dt>
                <dd>Start sending immediately</dd>

                <dt>Stop</dt>
                <dd>Stop sending immediately</dd>

                <dt>Elements (Speed)</dt>
                <dd>Sets the speed used for the spacing of dits and dahs within each individual character.</dd>

                <dt>Farnsworth (Speed)</dt>
                <dd>Sets the speed that will be used for spacing inbetween each character.</dd>
            </dl>
        </div>
    );
};

