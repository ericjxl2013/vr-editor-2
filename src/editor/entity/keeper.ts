import { EntityLoad } from "./entity-load";
import { Entities } from "./entities";
import { EntityCreate } from "./entity-create";
import { EntitySync } from "./entity-sync";
import { EntityEdit } from "./entity-edit";
import { EntityDelete } from "./entity-delete";

export class EntityKeeper {

    public constructor() {

        new Entities();

        new EntityEdit();

        new EntityCreate();

        new EntityLoad();

        new EntitySync();

        new EntityDelete();


        

    }



}