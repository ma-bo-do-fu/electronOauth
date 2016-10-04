const { OAuth } = require('oauth');
const {
  app,
  BrowserWindow,
  shell,
  ipcMain
} = require('electron');

let win;
const schema = 'electron';
app.on('ready', () => {
  win = new BrowserWindow();
  const oauth = new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.TWITTER_CONSUMER_KEY,
    process.env.TWITTER_CONSUMER_SECRET,
    '1.0A',
    null,
    'HMAC-SHA1'
  );

  oauth.getOAuthRequestToken((error, oauthToken, oauthTokenSecret, results) => {
    if (error) return;
    const authUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`;
    shell.openExternal(authUrl);

    win.loadURL(`file://${__dirname}/pinBased.html`);
    win.webContents.openDevTools();

    ipcMain.once('SEND_PIN', (e, args) => {
      const oauthVerifier = args.pin;
      console.log(oauthToken, oauthVerifier);
      oauth.getOAuthAccessToken(oauthToken, oauthTokenSecret, oauthVerifier, (err, accessToken, accessTokenSecret) => {
        console.log('accessToken', accessToken);
        console.log('accessTokenSecret', accessTokenSecret);
      });

      // ipcMain.on('asynchronous-message', (event, arg) => {
      //   console.log(arg);  // prints "ping"
      //   event.sender.send('asynchronous-reply', 'pong');
      // });
      //
      // ipcMain.on('synchronous-message', (event, arg) => {
      //   console.log(arg);  // prints "ping"
      //   event.returnValue = 'pong';
      // });
    });
  });
});
