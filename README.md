# My tools

[<img src="./SportTimer/public/stopwatch.svg" width="24" height="24" style="vertical-align: middle; margin-right: 8px;" /> Sport Timer](./SportTimer/dist/index.html)

[<img src="./FarnsworthCWTrainer/public/key.svg" width="24" height="24" style="vertical-align: middle; margin-right: 8px;" /> Farnsworth CW Trainer](./FarnsworthCWTrainer/dist/index.html)

[<img src="./Life/public/calendar.svg" width="24" height="24" style="vertical-align: middle; margin-right: 8px;" /> Life](./Life/dist/index.html)

<iframe src="./Life/dist/index.html" width="100%" height="2400px" style="border: 1px solid #333; border-radius: 8px;" scrolling="no"></iframe>

## Testing Production Builds Locally

To test a production build locally (avoiding CORS issues), navigate to the app directory and run:

```bash
npx serve dist
```

This will serve the built files over HTTP at `http://localhost:3000` (or another port if 3000 is busy).
