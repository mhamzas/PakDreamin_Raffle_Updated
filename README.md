This app initially built for Pakistan Dreamin' 2021.

<a href="https://githubsfdeploy.herokuapp.com">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>

You can preview the app using the url: https://hosted-scratch.herokuapp.com/launch?template=https://github.com/mhamzas/PakDreamin_Raffle_Updated

Please feel free to contribute and use in your projects.

Installation Steps, 
1. Create Public Experience Site (Community)
2. Drag n Drop the raffleHome LWC Component
3. Use {!session} and {!authCode} values for the component attributes (Which will be collected through QueryString)
4. Update Community Site url to the Custom Label

Usage,
1. Use the Urls generated on the Session record.
2. Moderator URL will allow RUN Raffle Button and Registration URL is for Public to Participate.
3. Participation and Raffle will run on the Session Date/Time only.
4. Once Winner is selected for any session, will be skipped for future Raffles.

# Update
Use the SF mobile app to scan the QR Code.
1. Upload Attendees as Person Accounts.
2. Use Google API to generate QR Code of Account Ids and use it on the QR Code Scanner.
3. Once scanned, the user will be added to the selected session as a participant.
4. Use the Moderated URL to run the raffle.
5. On the community WINNERS page, audience can see who won what.
6. Use se SHOP Scanner (on the mobile app) to mark the winner item CLAIMED.

# Pre-Requisite.
```
npm install -g gulp-cli
npm install --save-dev gulp sass gulp-sass gulp-beautify-code gulp-autoprefixer gulp-run
sfdx plugins:install @salesforce/lwc-dev-server
sfdx plugins:update
```