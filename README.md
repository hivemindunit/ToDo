![](src/assets/icons/android-chrome-192x192.png)
# Yet Another ToDo List
> Your simple and cross-platform application for personal productivity: https://www.get-it-done.ninja/

**Technologies and frameworks**
- UI: Ionic 5
- Backend: Firebase
- CI/CD & Hosting: AWS Amplify

## Build & Run
### Development
```
ionic serve
```
### Staging Web
```
firebase use staging && cd functions && npm run build && cd .. && npm run build:prod && firebase deploy
```
### Production Web
```
firebase use default && cd functions && npm run build && cd .. && npm run build:prod && firebase deploy
```
### Production Android
```
ionic build --prod
npx cap copy
npx cap open android
```
