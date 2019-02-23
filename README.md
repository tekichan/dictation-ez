# Dictation Easy (dictation-ez)
### Dictation Easy. This app helps students do dictation on their own. 
[![License](https://img.shields.io/badge/license-MIT-green.svg)](/LICENSE) 

## Introduction
This is an app to assist students to do revision for dictation. The app takes a picture of dictation content and converts it to text. Then you can select to read the text content. This app makes use of [React JS](https://reactjs.org/) plus Onsen UI as frontend libraries. I referenced Material Design as visual principle.

The app has been published to Github Pages at https://tekichan.github.io/dictation-ez/. The app is responsive, so it can be properly opened with a desktop web browser or a mobile web browser.

## Prerequisites
1. Register a TTS Service. Here we use a free service provided by [Voice RSS](http://www.voicerss.org/)
2. Register a OCR Service. Here we use a free service provided by [OCR Space](https://ocr.space/)
3. Install [NodeJS](https://nodejs.org) with [NPM](https://www.npmjs.com/)
4. Install [Create React App](https://github.com/facebook/create-react-app)
5. Install [Onsen UI](https://onsen.io/)
6. Install [axios](https://github.com/axios/axios)
7. Install [gh-pages](https://www.npmjs.com/package/gh-pages) for deploying a production build to [Github Pages](https://pages.github.com/)
8. Select a color theme in [Material Design Color Tool](https://material.io/tools/color/)
9. Generate a CSS set for Onsen UI theme in [Onsen UI Theme Roller](https://onsen.io/theme-roller)

## Getting Started
### High Level Design
![High Level Design](/doc/dictez_highleveldesign.png)

The app runs with App.js which is a default entry point of React JS app. It uses DictEzApp tag to define the container of the main contents, which are OCR Page and TTS Page. DictEzApp shows OCR Page as the home page. OCR Page uses ImageUtils to convert an uploaded or camera captured Image file into a binary array in BASE64 format for OcrService to convert the image to text. After OCR process DictEzApp will redirect to TTS Page and show the converted text. When the text is clicked, TTS Page will use TtsService to convert the text to a voice data in BASE64 format. Then the voice can be played in the page. DictEzApp will return OCR Page when a home button is pressed.

### Build App Skeleton
The next step is to create the app folder and essential components according to the high level design.

1. Run `npx create-react-app dictation-ez` to create an app folder for React JS. The fundamental components and configurations have been in place. A Hello-World style app is available. You can run `npm start` to run the app in your local machine and navigate it at `http://localhost:3000/`.
2. Run `cd dictation-ez` to access the app folder. 
3. Install Onsen UI with `npm install onsenui react-onsenui --save` for beautiful UI components.
4. Install axios with `npm install axios --save`.
5. Install gh-pages with `npm install gh-pages --save-dev` for Github Pages deployment.
6. Copy css files which are made in Onsen UI Theme Roller to the folder `src/onsenui/css` for the whole app to use.
7. Copy the app's background image to the folder `src/images`.
8. Modify the webpage title in `public/index.html`.
9. Create components under the folder `src/dict-ez`:
- `DictEzApp.js` is the core component to control the data flow.
- `OcrPagejs` is the page component to provide Image Upload and Image to Text functions.
- `OcrPage.css` is the style sheet specific for `OcrPage.js`.
- `TtsPage.js` is the page component to display converted text and play voice of the text.
- `ImageUtils.js` includes the utility functions to provide image files.
- `OcrService.js` is the service component to call OCR API Service.
- `TtsService.js` is the service component to call TTS API Service.
- `config.js` is the configuration file. It contains API keys of the services.
10. After the React JS components are created, modify `App.js` to show `DictEzApp` in render() function to refer DictEzApp component.
```Javascript
    return (
<DictEzApp></DictEzApp>
    );
  }
```
11. Run `npm start` for a local development server. Preview the app in the serve. Fine tune codes and logics.
12. Build the app for production deployment and deploy it to Github Pages.
```Shell
npm run deploy
```


## Appendix A: Get started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

## Appendix B: Onesen UI
[Onsen UI](https://onsen.io/)

### Install with NPM
```Bash
npm install onsenui --save
npm install onsenui react-onsenui --save
```

## Appendix C: axios
[axios](https://github.com/axios/axios) is a Promise based HTTP client for the browser and node.js.

### Install with NPM
```Bash
npm install axios --save
```

## Appendix D: gh-pages
[gh-pages](https://www.npmjs.com/package/gh-pages) is a tool to publish Web App build to a gh-pages branch on GitHub.

### Step 1: Installation
```Bash
npm install gh-pages --save-dev
```

### Step 2: Define
Modify package.json and input "homepage", "predeploy" and "deploy" under "scripts" section.

### Step 3: Run
```Bash
npm run deploy
```


## Authors
- Teki Chan *tekichan@gmail.com*
