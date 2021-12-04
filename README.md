# DAT9 Website

[![Manual release to Firebase Hosting site](https://github.com/RasmusBuchholdt/dat9-biofeedback-game/actions/workflows/manual.yml/badge.svg?branch=main)](https://dat9-biofeedback-game.web.app/)

This website is used for a scientific paper as a biofeedback system that helps calm down people with stress through breathing exercises. The website implements the usage of a Bluetooth Low Energy (BLE) spirometer [SpiroMagic](https://spiromagic.dk/) that is used for these breathing exercises.

There is no public API available for the SpiroMagic spirometer to read its output, so the GATT services and characteristics were acquired by using the [LightBlue®](https://play.google.com/store/apps/details?id=com.punchthrough.lightblueexplorer) BLE scanning tool.

## Dependecies

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) and uses [ThreeJS](https://threejs.org/) and [Web Bluetooth API](https://web.dev/bluetooth/) combined with [Angular](https://angular.io/) 12.9 and [Bootstrap](https://getbootstrap.com/) in Version 4.6.

## Links

* Three Extensions: https://github.com/Itee/three-full
* Three-Full Types: https://discourse.threejs.org/t/angular-threejs/2739/7
* Web Bluetooth module: https://github.com/manekinekko/angular-web-bluetooth
* Web Bluetooth examples: https://googlechrome.github.io/samples/web-bluetooth/
* Firebase CLI: https://firebase.google.com/docs/cli

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change
any of the source files.

## Deployment

The repository is set up with GitHub actions to deploy directly to a Firebase hosting application. The deployment action can be seen [here](https://github.com/RasmusBuchholdt/dat9-website/blob/main/.github/workflows/manual.yml).

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also
use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out
the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
