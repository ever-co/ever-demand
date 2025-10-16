# Ever Shop Mobile App (Flutter version)

## Setting up Your Development Environment

Find instructions for setting up your development machine with the Flutter framework on Flutter’s Get started page. The specific steps vary by platform, but they follow this basic format:

    1. Download the installation bundle for your development machine’s operating system to get the latest stable release of the Flutter SDK.
    2. Extract the installation bundle in the desired location.
    3. Add the flutter tool to your path.
    4. Run the flutter doctor command, which alerts you to any problems with the Flutter installation.
    5. Install missing dependencies.
    6. Set up your IDE with a Flutter plugin/extension.
    7. Test drive an app.

The instructions provided on the Flutter website are very well done and allow you to easily set up a development environment on your platform of choice. The remainder of this tutorial assumes you’ve set up VS Code for Flutter development and that you’ve addressed any issues flutter doctor found. You can also use Android Studio to follow along.

To run your project as a mobile app, you’ll need to use one of the following options:

    - Run either iOS Simulator or an Android emulator.
    - Have an iOS or Android device set up for development.
    - Run your code as a web app.
    - Finally, you can run your code as a desktop app.

Even if your final target is mobile, using a web or desktop app during development gives you the advantage of being able to resize the app and observe how it would look with various screen sizes. If you have an older computer, the web or desktop version will also load faster than the Android emulator or iOS Simulator.

NOTE: TO BUILD AND TEST ON IOS SIMULATOR OR AN IOS DEVICE, YOU’LL NEED TO USE MACOS WITH XCODE. ALSO, EVEN IF YOU’RE PLANNING TO USE VS CODE AS YOUR MAIN IDE, THE EASIEST WAY TO GET THE ANDROID SDK AND ANDROID EMULATOR IS TO INSTALL ANDROID STUDIO AS WELL.

Clone or download the latest version of the project on https://github.com/ever-co/ever-demand
Open the project in either VS Code or Android Studio.

Open it in VS Code by opening the root folder. You’ll need to fetch packages before running the project. 
Do so by pressing Command-Shift-P on MacOS or Control-Shift-P on Windows or Linux to open the command palette and running the Flutter: Get Packages command.

To open the project in Android Studio, choose Open an existing project from the Welcome to Android Studio screen and navigate to choose the root folder of the final project. Then choose Get dependencies on the 'Pub get' has not been run line in Android Studio.

## Project Structure

    -> assets : here we have fonts, i18n, colors and images
    -> lib : here are all the codes
        -> models
        -> screens
        -> middlewares,...
    -> test: will contain all our tests
