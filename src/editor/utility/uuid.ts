import SparkMD5 from "spark-md5";

export class UUid {
    public static createUuid = () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            var r = (Math.random() * 16) | 0,
                v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };

    // 秒时间戳
    public static createAssetID = () => {
        return (
            Math.round(new Date().getTime() / 1000).toString() +
            "-" +
            UUid.createUuid().substring(0, 8)
        );
    };

    private static getRealTime(str:number) {
        if (str < 10) {
            return "0" + str;
        }
        return str;
    }

    public static createdAtTime() {
        var now = new Date();
        var Y = now.getFullYear();
        var m = UUid.getRealTime(now.getMonth() + 1);
        var d = UUid.getRealTime(now.getDate());
        var H = UUid.getRealTime(now.getHours());
        var i = UUid.getRealTime(now.getMinutes());
        // var s = getRealTime(now.getSeconds());
        return Y + "-" + m + "-" + d + " " + H + ":" + i;
    }

    public static getmd5=async(file:File)=>{
        return new Promise<string>(async (resolve, reject) => {
            var blobSlice = File.prototype.slice ;
            var chunkSize = 2097152, // 每次读取2MB
            chunks = Math.ceil(file.size / chunkSize),
            currentChunk = 0,
            spark = new SparkMD5.ArrayBuffer(),
            frOnload = function(e:any){
                spark.append(e.target.result);
                currentChunk++;
                if (currentChunk < chunks)
                    loadNext();
                else{
                    resolve(spark.end());
                }
            },
            frOnerror = function () {
                reject("error");
            };
            function loadNext() {
                var fileReader = new FileReader();
                fileReader.onload = frOnload;
                fileReader.onerror = frOnerror;
                var start = currentChunk * chunkSize,
                    end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
                fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
            };
            loadNext();
        })
    }
}