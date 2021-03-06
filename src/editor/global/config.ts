export class Config{

    public static projectID: string = 'projectID';
    public static projectName: string;
    public static scenesData: any;
    public static sceneIndex: number = 0;
    public static sceneID: string = 'sceneID';
    public static sceneName: string;
    public static lastScene: string;
    public static userID: number;
    public static username: string;

    public static assetsData: any;

    public static isSceneDirty: boolean = false;


    public static x: number = 4;
    public static y: number = 291;
    public static width: number = 444;
    public static height: number = 250;

    // TODO: 暂时只允许加载一个表格
    public static tableAssetsID: string = '';
    public static assetStandard="{\"assets\":{},\"geometry\":{},\"babylon\":{\"path\":{}},\"babylon_resource\":{}}";
    public static sceneStandard="{\"scenes\":[{\"id\":\"33a884dd\",\"projectId\":\"2af1e58b\",\"name\":\"新建场景\",\"created\":\"2020-07-04 18:00\",\"modified\":\"2020-07-04 18:00\",\"entities\":{\"799f7762-3ef2-4564-a59b-c0ae959a90ce\":{\"name\":\"新建场景\",\"type\":\"root\",\"root\":true,\"parent\":null,\"resource_id\":\"799f7762-3ef2-4564-a59b-c0ae959a90ce\",\"tags\":[],\"enabled\":true,\"scale\":[1,1,1],\"position\":[0,0,0],\"rotation\":[0,0,0],\"children\":[\"5e7ecc24-75b7-445a-b381-a66bd7699163\",\"3109cca1-b962-4fd5-a83a-0b28719d2616\",\"3e8d0d21-726a-427d-bf34-7baaebdff54c\"],\"asset_id\":\"\",\"babylon_id\":\"\"},\"5e7ecc24-75b7-445a-b381-a66bd7699163\":{\"name\":\"主相机\",\"type\":\"camera\",\"parent\":\"799f7762-3ef2-4564-a59b-c0ae959a90ce\",\"resource_id\":\"5e7ecc24-75b7-445a-b381-a66bd7699163\",\"tags\":[],\"enabled\":true,\"scale\":[1,1,1],\"position\":[0,100,-200],\"rotation\":[0,0,0],\"mode\":0,\"fov\":0.8,\"inertia\":0.9,\"orthoSize\":0.5,\"children\":[],\"ellipsoid\":[0.5,1,0.5],\"ellipsoidOffset\":[0,0,0],\"checkCollisions\":true,\"applyGravity\":true,\"minZ\":1,\"maxZ\":20000,\"priority\":0,\"viewport\":[0,0,1,1],\"clearColor\":[0.176,0.569,0.729,1]},\"3109cca1-b962-4fd5-a83a-0b28719d2616\":{\"name\":\"环境光\",\"type\":\"light\",\"parent\":\"799f7762-3ef2-4564-a59b-c0ae959a90ce\",\"resource_id\":\"3109cca1-b962-4fd5-a83a-0b28719d2616\",\"tags\":[],\"subtype\":\"hemispheric\",\"enabled\":true,\"position\":[300,300,300],\"rotation\":[0,0,0],\"scale\":[1,1,1],\"children\":[]},\"3e8d0d21-726a-427d-bf34-7baaebdff54c\":{\"name\":\"立方体\",\"type\":\"primitive\",\"subtype\":\"box\",\"resource_id\":\"3e8d0d21-726a-427d-bf34-7baaebdff54c\",\"babylon_id\":\"\",\"asset_id\":\"\",\"parent\":\"799f7762-3ef2-4564-a59b-c0ae959a90ce\",\"position\":[0,0,0],\"rotation\":[0,0,0],\"scale\":[1,1,1],\"children\":[],\"enabled\":true,\"checkCollisions\":false,\"pickable\":true,\"isVisible\":true,\"tags\":[],\"material_id\":\"\"}}}],\"last\":0}";
    public static tableStandard="{\"table\":[[\"对象/模板对象\",\"触发激活条件\",\"触发名\",\"触发参数\",\"逻辑条件\",\"变量定义/状态定义和赋值\",\"响应名\",\"响应参数/变量赋值\",\"关联状态\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"]]}";

    public constructor () {

    }

}