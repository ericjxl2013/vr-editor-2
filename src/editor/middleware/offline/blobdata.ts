import { WebRequest } from './webrequest';
import { VeryEngine } from '../../../engine';

export class BlobData {


    public constructor(url: string) {

        var xhr = new WebRequest(),
            blob: Blob;

        xhr.open('GET', url);
        xhr.responseType = 'blob';

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                // Blob as response (XHR2)
                blob = xhr.response;
                console.log(blob);

                var newTexture = { textureUrl: url, data: blob };

                VeryEngine.database.add( {data: newTexture, xxx: 'eric' });

                console.log(newTexture);
            }
            else {
                // image.src = url;
            }
        }, false);

        xhr.addEventListener('error', () => {
            // Logger.Error('Error in XHR request in BABYLON.Database.');
            // image.src = url;
            console.error('error');
        }, false);

        xhr.send();
    }


}