const router = require("koa-router")();
const table = require("../controller/tableManager.js");
const mock = require("../controller/mock-controller.js");
const mockUpload = require("../controller/mock-upload.js");
const mockTable = require("../controller/mock-table");
// const send = require('koa-send');


// mock数据进行测试
router.get("/api/projects", mock.projects);
router.post("/api/createProject", mock.createProject);

router.post("/api/getProject", mock.getProject);
router.post("/api/getJsonConfig", mock.getJsonConfig);
router.post("/api/uploadJsonConfig", mock.uploadJsonConfig);


router.put("/api/uploadFile", mock.uploadFile);
router.post("/api/getJsonAsset", mock.getJsonAsset);
router.post("/api/uploadJsonAsset", mock.uploadJsonAsset);



router.post("/api/addScene", mockUpload.addScene);

// table
router.get("/api/table/acquire", mockTable.acquire);
router.post("/api/table/commit", mockTable.commit);

module.exports = router;
