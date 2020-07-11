import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'

admin.initializeApp();

export const reorderTasks = functions.https.onCall(async (request, context) => {
    if(typeof request.ids !== 'undefined' && typeof context.auth !== 'undefined') {
        const todos = await admin.firestore().collection('users/' + context.auth.uid + '/todos').get();
        const batch = admin.firestore().batch();
        todos.forEach(snapshot => {
            // @ts-ignore
            // let index = '/users/'+context.auth.uid+'/todos/'+snapshot.id+'/order';
            // console.log(index);
            // @ts-ignore
            let i = request.ids.findIndex(x => x === snapshot.id);
            batch.update(snapshot.ref,  {order: i});
            return false;
        });
        await batch.commit();
    }
    return true;
});
