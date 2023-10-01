/*
Global Dependencies:
    Gulp CLI
    
Project Dependencies:
    Gulp (^4.0.0)
    Gulp Sass
    Gulp Beautify Code
    Gulp Autoprefixer
    Gulp Run
    
Installation:
    npm install -g gulp-cli
    npm install --save-dev gulp sass gulp-sass gulp-beautify-code gulp-autoprefixer gulp-run
    sfdx plugins:install @salesforce/lwc-dev-server
    sfdx plugins:update

Available Tasks:
    sass - Compile *.scss files to *.css
    auth - Auth into the hub org and set it as the default hub org for the project
    create - Create a new default scratch org with an alias matching the orgName in the project-scratch-def.json (expires in 30 days)
    delete - Enqueue the scratch org with an alias matching the orgName in the project-scratch-def.json for deletion
    password - Create a new password for the org's user
    open - Open the default scratch org
    install - Install a package to the default scratch org; you must use the -p flag following the package id
    component - Create a new component; requires the -n flag following a name for the component; use the -a flag to create an Aura component
    push - Push your local files into the default scratch org; can be used with the --force flag
    pull - Pull your default scratch org files into your local; can be used with the --force flag
    serve (Beta) - Initialize the local development server and open it in your browser
    watch - Watch for local changes and auto-push
    watch:sass - Watch for local changes to *.scss files and auto-compile
    default - Run the sass and push tasks, then run the watch task
*/

const { src, dest, series, watch } = require('gulp');
const beautifyCode = require('gulp-beautify-code');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass')(require('sass'));
const run = require('gulp-run');
const config = require('./config/project-scratch-def.json');

/* --------------------------------------------------
Logging
-------------------------------------------------- */
function outputError(error) {
    console.log('\x1b[31m', '\r\n********** Task failed. See error(s) below. **********');
    console.log('\x1b[0m', '');
    
    if(error && error.status) {
        console.log(error.status);
    }
}

function outputSuccess() {
    console.log('\x1b[32m', '\r\n********** Task completed successfully. **********');
    console.log('\x1b[0m', '');
}

function outputResults(error) {
    if(error) {
        outputError(error);
    } else {
        outputSuccess();
    }
}

/* --------------------------------------------------
Compilation
-------------------------------------------------- */
function compileSass() {
    return src('./force-app/main/default/**/*.scss', { base: './' })
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(beautifyCode({
            indent_size: 4,
            indent_char: ' '
        }))
        .pipe(dest('./'));
}

/* --------------------------------------------------
Org Management
-------------------------------------------------- */
function authOrg() {
    return run('sfdx force:auth:web:login -d').exec([], outputResults);
}

function createOrg() {
    return run('sfdx force:org:create -s -f config/project-scratch-def.json -d 30 -a "' + config.orgName + '"').exec([], outputResults);
}

function deleteOrg() {
    return run('sfdx force:org:delete -p -u "' + config.orgName + '"').exec([], outputResults);
}

function generatePassword() {
    return run('sfdx force:user:password:generate').exec([], outputResults);
}

function openOrg() {
    return run('sfdx force:org:open').exec([], outputResults);
}

function installPackage() {
    let argIndex = process.argv.indexOf('-p');
    let id;
    
    if(argIndex !== -1) {
        id = process.argv[argIndex + 1];
        
        return run('sfdx force:package:install -r --package ' + id).exec([], outputResults);
    } else {
        outputError({ status: 'ERROR: Please specify the package id using the -p flag.' });
    }
}

/* --------------------------------------------------
Source Management
-------------------------------------------------- */
function createComponent() {
    let aura = process.argv.indexOf('-a') !== -1;
    let name = process.argv[process.argv.indexOf('-n') + 1];

    return run('sfdx force:lightning:component:create -n ' + name + ' -d ./force-app/main/default/' + (aura ? 'aura' : 'lwc --type lwc'), { verbosity: 3 }).exec([], outputResults);
}

function pushSource() {
    let force = process.argv.indexOf('--force') !== -1;
    
    return run('sfdx force:source:push' + (force ? ' -f' : ''), { verbosity: 3 }).exec([], outputResults);
}

function pullSource() {
    let force = process.argv.indexOf('--force') !== -1;
    
    return run('sfdx force:source:pull' + (force ? ' -f' : '')).exec([], outputResults);
}

function startServer() {
    run('sfdx force:lightning:lwc:start').exec();
    
    return setTimeout(() => {
        run('open "http://localhost:3333"', { verbosity: 0 }).exec();
    }, 5000);
}

/* --------------------------------------------------
Miscellaneous
-------------------------------------------------- */
function initWatchSass() {
    watch(['./force-app/main/default/**/*.scss'], compileSass);
}

function initWatch() {
    initWatchSass();
    watch(['./force-app/main/default/**/*.{cls,trigger,cmp,component,html,css,js,email,tokens,xml,evt,page,design,app,svg,png,jpg,jpeg,gif}'], pushSource);
}

Object.assign(exports, {
    'sass': compileSass,
    'auth': authOrg,
    'create': createOrg,
    'delete': deleteOrg,
    'password': generatePassword,
    'open': openOrg,
    'install': installPackage,
    'component': createComponent,
    'push': pushSource,
    'pull': pullSource,
    'serve': startServer,
    'watch': initWatch,
    'watch:sass': initWatchSass,
    'default': series(compileSass, pushSource, initWatch)
});