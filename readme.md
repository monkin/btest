# BTest

Test task made with 'react-native'.

Most probably it works only on Android, because I had no Apple devices to develop and test with.

Redux and typed-redux-saga are used as a state management solution.

Some tests could be found here: <https://github.com/monkin/btest/tree/master/src/state/__tests__>

## How to run

Use `npm run android` to start, `npm test` to run tests.

## Features

* Load top posts from 'programming' subreddit
* It "has infinity scrolling" with 20 items per page loaded at once
* Show splash screen during posts loading
* Save posts to 'async-storage' and use that data at start or if network is not available
* Check for updates every minute

Feel free to write at monkin.andrey@gmail.com in case of any questions.
