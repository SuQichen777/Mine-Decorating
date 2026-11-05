//make an array of furniture
let allInstance = [];
let wallInstance = [];
let selectedPlatform = null;//floor, left_wall, right_wall, back_wall
let selectedInstance = null;//an instance of character or furniture
let mode = {
    edit: true,
    view: false,
}

//define basic room
let texture_ = Math.floor(Math.random() * 4);
let floor = {
    position: { x: 0, y: -.5, z: -.3 },
    size: { x: .4, y: .02, z: .4 },
    visible: true,
    platform_selected: false,
};
let left_wall = {
    size: { x: .02, y: .4 + floor.size.y, z: .4 },
    position: { 
        x: floor.position.x - floor.size.x - .02,//x size
        y: floor.position.y + .4,//y size
        z: floor.position.z
    },
    visible: true,
    platform_selected: false,
};
let right_wall = {
    size: { x: .02, y: .4 + floor.size.y, z: .4 },
    position: { 
        x: floor.position.x + floor.size.x + .02,//x size
        y: floor.position.y + .4,//y size
        z: floor.position.z
    },
    visible: true,
    platform_selected: false,
};
let back_wall = {
    // size: { x: .4 + left_wall_x + right_wall_x , y: .4 + floor.size.y, z: .02 },
    size: { x: .44 , y: .4 + floor.size.y, z: .02 },
    position: { 
        x: floor.position.x,
        y: floor.position.y + .4,//y size
        z: floor.position.z - floor.size.z - .02
    },
    visible: true,
    platform_selected: false,
};
let celling = {
    size: { x: .4, y: .02, z: .4 },
    position: { 
        x: floor.position.x,
        y: floor.position.y + .4 * 2,
        z: floor.position.z
    },
    visible: true,
};

let no_platform = {
    platform_selected: false,
};

//default 8 * 8 floor
let floor_condi = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
]
let left_wall_condi = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
]

let right_wall_condi = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
]

let back_wall_condi = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
]

let hidePlatform = (platform) =>{

    if(platform.visible){
        platform.visible = false;
    } else {
        platform.visible = true;
    }
}

let selectPlatform = (platform) => {
    floor.platform_selected = false;
    left_wall.platform_selected = false;
    right_wall.platform_selected = false;
    back_wall.platform_selected = false;
    if (platform != no_platform) {
        platform.platform_selected = true;
        selectedPlatform = platform;
    } else {
        selectedPlatform = null;
    }
}

//the "Select ..." buttons: highlight a platform, and a decoration being edited moves to the chosen wall
let choosePlatform = (platform) => {
    let is_wall = platform == back_wall || platform == left_wall || platform == right_wall;
    if (is_wall && selectedInstance instanceof WallDecoration && selectedInstance.platform != platform){
        selectedInstance.moveToWall(platform);
    }
    selectPlatform(platform);
}

//the 8 * 8 table of taken cells of a platform
let platformCondi = (platform) => {
    if (platform == floor){
        return floor_condi;
    } else if (platform == left_wall){
        return left_wall_condi;
    } else if (platform == right_wall){
        return right_wall_condi;
    } else if (platform == back_wall){
        return back_wall_condi;
    }
    return null;
}

//set every cell an item covers to 1 (taken) or 0 (free)
let setCells = (item, value) => {
    let condi = platformCondi(item.platform);
    for (let i = item.pos_forward; i < item.pos_forward + item.unit_length_forward; i++){
        for (let j = item.pos_right; j < item.pos_right + item.unit_length_right; j++){
            condi[i][j] = value;
        }
    }
}

let selectItem = () => {
    if (mode == 'view'){
        return
    }
    //floor furniture first, then wall decorations
    let items = allInstance.concat(wallInstance);
    let index = -1;
    if (selectedInstance != null){
        index = items.indexOf(selectedInstance);
        //stop editing the current one (it is removed if it cannot stay there)
        let can_be_added = stopChangeItem();
        if (!can_be_added){
            deleteItem();
        }
    }
    //the next item after the current one that is still in the room
    let remaining = allInstance.concat(wallInstance);
    selectedInstance = null;
    for (let k = 1; k <= items.length; k++){
        let candidate = items[(index + k) % items.length];
        if (remaining.includes(candidate)){
            selectedInstance = candidate;
            break;
        }
    }
    if (selectedInstance == null){
        //nothing to select, e.g. an empty room
        return;
    }
    console.log("Selected Index", remaining.indexOf(selectedInstance));

    //clear the selected place, it is free while the item is being edited
    //(a small thing on a table shares the table's cells, they stay taken)
    if (!selectedInstance.is_placed_on_table){
        setCells(selectedInstance, 0);
    }
    selectedInstance.is_under_editing = true;
}

let rotateItem = (dir) => {
    if(mode.view){
        return
    }
    if (selectedInstance != null && selectedInstance.can_rotate){
        if (dir == 'red'){
            selectedInstance.rotateRed();
        } else if (dir == 'blue'){
            selectedInstance.rotateBlue();
        }
    }
}

let moveItem = (dir) => {
    if(mode.view){
        return
    }
    if (selectedInstance != null){
        if (dir == 'red'){
            selectedInstance.moveRed();
        } else if (dir == 'blue'){
            selectedInstance.moveBlue();
        }
    }
}

//check
let stopChangeItem = () => {

    let flag = true;
    let overlapping = false;
    if (selectedInstance != null){
        if(selectedPlatform != no_platform && selectedPlatform != null){
            selectPlatform(no_platform);
        }
        //see overlapping
        if (selectedInstance.platform == floor){
            let x = selectedInstance.pos_right;
            let y = selectedInstance.pos_forward;
            if (selectedInstance.is_small_thing){
                if (selectedInstance.is_placed_on_table){
                    let table = selectedInstance.placing_table;
                    let index = table.item_on_table.indexOf(selectedInstance);
                    table.item_on_table.splice(index, 1);
                    selectedInstance.is_placed_on_table = false;
                }                
            }
            for (let i = x; i < x + selectedInstance.unit_length_right; i++){
                for (let j = y; j < y + selectedInstance.unit_length_forward; j++){
    
                    if (floor_condi[j][i] == 1){
                        //overlapping with another object
                        if(selectedInstance.is_small_thing){
        
                            //see whether the overlapping object is table
                            //if it is, then the small thing can be placed on it
                            for (let instance of allInstance){
                                if (instance.is_table){
                                    for (let k = instance.pos_right; k < instance.pos_right + instance.unit_length_right; k++){
                                        for (let l = instance.pos_forward; l < instance.pos_forward + instance.unit_length_forward; l++){
                                            if (k == i && l == j){
                                                //if the small thing is placed on the table
                                                //check all the small thing on the table
                                                for (let small_thing of instance.item_on_table){
                                                    if (small_thing.pos_right == i && small_thing.pos_forward == j){
                                                        overlapping = true;
                                                        flag = false;
                                                        break;
                                                    }
                                                }
                                                if (!overlapping){
                                                    selectedInstance.is_placed_on_table = true;
                                                    instance.item_on_table.push(selectedInstance);
                                                    selectedInstance.placing_table = instance;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (selectedInstance.is_placed_on_table){
                                overlapping = false;
                                flag = true;
                            } else {
                                overlapping = true;
                                flag = false;
                            }               
                        } else {
                            //not small thing
                            overlapping = true;
                            flag = false;
                            break;
                        }
                    }
                }
            } 
            console.log(overlapping);
            if (overlapping){
                flag = false;
            } else {
                flag = true;
            }
        }
        //when it is on the wall
        //don't need to check small thing
        else {
            let condi = platformCondi(selectedInstance.platform);
            let x = selectedInstance.pos_right;
            let y = selectedInstance.pos_forward;
            for (let i = x; i < x + selectedInstance.unit_length_right; i++){
                for (let j = y; j < y + selectedInstance.unit_length_forward; j++){
                    if (condi[j][i] == 1){
                        overlapping = true;
                        flag = false;
                        break;
                    }
                }
            }
            if (overlapping){
                flag = false;
            }
        }

        //cosole log floor
        // for (let i = 0; i < floor_condi.length; i++){
        //     console.log(floor_condi[i]);
        // }

        //if flag is true, the place is fine: take its cells and stop editing
        //(a failed check must not take any cell)
        if (flag){
            setCells(selectedInstance, 1);
            selectedInstance.is_under_editing = false;
            selectedInstance = null;
        }
        return flag;
    }
}

//take an item out of the room
let removeInstance = (item) => {
    item.visible = false;
    for (let list of [allInstance, wallInstance]){
        let index = list.indexOf(item);
        if (index >= 0){
            list.splice(index, 1);
        }
    }
    //a small thing leaves its table
    if (item.is_placed_on_table && item.placing_table){
        let things = item.placing_table.item_on_table;
        if (things.includes(item)){
            things.splice(things.indexOf(item), 1);
        }
        item.is_placed_on_table = false;
        item.placing_table = null;
    }
    //the things on a table go with it (same as when the table moves)
    if (item.is_table){
        for (let thing of item.item_on_table.slice()){
            removeInstance(thing);
        }
        item.item_on_table = [];
    }
}

let deleteItem = () => {
    if (mode == 'view'){
        return
    }
    if (selectedInstance != null){
        removeInstance(selectedInstance);
        selectedInstance = null;
    }
}


function changeWithCursor(){
    M.perspective(3).turnX(ry / 100).turnY(rx / 100).move(0, .2, -.2).scale(2);
}
//for each class, we need to define a function to draw it
//other feature:
    //platform(e.g. table can only be placed on floor)
    //unit_length_forward 
    //unit_length_right 
    //can_rotate (unit_length_forward and unit_length_right can be swapped)
    //visible (only visible object will be drawn)
    //is small thing (e.g. cup, can be placed on table)
    //is table or not
    //is under editing (e.g. selected object will be highlighted)
    //position_1 (0-7)
    //position_2

//the method to check whether a furniture can be placed on a platform
//1.not overlap with other furniture (use the array of allInstance)
//2.not out of the platform (use unit_length_forward and unit_length_right)

//the four directions the red arrow can face, in the order "rotate blue" walks through them
const FACES = ['forward', 'right', 'backward', 'left'];
const FACE_ANGLE = {
    forward: 0,
    right: Math.PI / 2,
    backward: Math.PI,
    left: -Math.PI / 2,
};
//one "move red" step for each facing, as [pos_forward change, pos_right change]
const RED_STEP = {
    forward: [1, 0],
    right: [0, 1],
    backward: [-1, 0],
    left: [0, -1],
};

//shared by every furniture: grid position, moving, rotating and the editing arrows
//subclasses only set their size / flags and draw their own model in drawModel()
class Furniture {
    constructor(platform){
        this.platform = platform;
        this.unit_length_forward = 1; // forward and backward
        this.unit_length_right = 1; // left and right
        this.pos_forward = 0;
        this.pos_right = 0;
        this.can_rotate = true;
        this.visible = true;
        this.is_small_thing = false;
        this.is_placed_on_table = false;
        this.placing_table = null;
        this.is_table = false;
        this.is_under_editing = true;
        this.red_face = {
            forward: true,
            backward: false,
            left: false,
            right: false,
        }
        this.model_scale = .14;
    }

    //'forward', 'right', 'backward' or 'left'
    facing(){
        for (let face of FACES){
            if (this.red_face[face]){
                return face;
            }
        }
        return 'forward';
    }

    setFacing(face){
        for (let f of FACES){
            this.red_face[f] = (f == face);
        }
    }

    //largest cell index the item may cover going forward / right
    //(an item covers the cells pos .. pos + length - 1)
    maxForward(){
        return 7;
    }

    maxRight(){
        return 7;
    }

    //on whole cells and inside the platform
    fits(){
        return Number.isInteger(this.pos_forward) && Number.isInteger(this.pos_right) &&
            this.pos_forward >= 0 && this.pos_right >= 0 &&
            this.pos_forward + this.unit_length_forward - 1 <= this.maxForward() &&
            this.pos_right + this.unit_length_right - 1 <= this.maxRight();
    }

    canMoveAlong(pos, length, step, max){
        if (step > 0){
            return pos + length - 1 < max;
        }
        if (step < 0){
            return pos > 0;
        }
        return true;
    }

    //change the position by whole cells (a table also carries the things on it)
    shift(d_forward, d_right){
        this.pos_forward += d_forward;
        this.pos_right += d_right;
    }

    tryMove(d_forward, d_right){
        if (this.canMoveAlong(this.pos_forward, this.unit_length_forward, d_forward, this.maxForward()) &&
            this.canMoveAlong(this.pos_right, this.unit_length_right, d_right, this.maxRight())){
            this.shift(d_forward, d_right);
        }
    }

    moveRed(){
        let [d_forward, d_right] = RED_STEP[this.facing()];
        this.tryMove(d_forward, d_right);
    }

    //blue is red turned by 90 degrees
    moveBlue(){
        let [d_forward, d_right] = RED_STEP[this.facing()];
        this.tryMove(-d_right, d_forward);
    }

    //turn by 90 degrees: swap the lengths and pick the next facing (+1 blue, -1 red)
    turn(step){
        let temp = this.unit_length_forward;
        this.unit_length_forward = this.unit_length_right;
        this.unit_length_right = temp;
        let index = FACES.indexOf(this.facing());
        this.setFacing(FACES[(index + step + FACES.length) % FACES.length]);
    }

    //turning swaps the lengths, the item must still fit on the platform afterwards
    canTurn(){
        return this.pos_forward + this.unit_length_right - 1 <= this.maxForward() &&
            this.pos_right + this.unit_length_forward - 1 <= this.maxRight();
    }

    rotateBlue(){
        if (this.canTurn()){
            this.turn(1);
        }
    }

    rotateRed(){
        if (this.canTurn()){
            this.turn(-1);
        }
    }

    draw(){
        if (this.visible)
        {
            M.S();
            //change to specific position and rotate base on red face
            this.moveToPlace();
            this.drawModel();
            //draw instruction
            if (this.is_under_editing){
                selectPlatform(this.platform);
                this.drawArrows();
            }
            M.R();
        }
    }
}

//furniture standing on the floor
//red arrow points to +z of the model, blue arrow to +x
class FloorFurniture extends Furniture {
    constructor(){
        super(floor);
    }

    //move from the first cell to the middle of all the cells the item covers
    centerOnCells(){
        M.move((this.unit_length_right - 1) * floor.size.x / 8, 0, (this.unit_length_forward - 1) * floor.size.z / 8);
    }

    moveToPlace(){
        M.move(floor.position.x + ((this.pos_right - 3)*2-1) * floor.size.x / 8,
             -.43 ,
             floor.position.z + ((this.pos_forward - 3)*2-1) * floor.size.z / 8);
        this.centerOnCells();
        M.scale(this.model_scale);
        if (this.is_placed_on_table){
            M.move(0, .42, 0);
        }
        M.turnY(FACE_ANGLE[this.facing()]);
    }

    drawArrows(){
        M.S().move(0, .35, .08).scale(.02,.02,.08).draw(Cube(), [1, 0, 0], 1).R();
        M.S().move(.1, .35, .02).scale(.08,.02,.02).draw(Cube(), [0, 0, 1], 1).R();
    }
}

//decorations hanging on a wall
//pos_forward is the height, pos_right goes to the right when you face the wall from inside the room
//(back wall: +x, left wall: towards the back, right wall: towards the front)
//red arrow points to -z of the model, blue arrow to +x
class WallDecoration extends Furniture {
    constructor(){
        super(back_wall);
        this.unit_length_forward = 2;
        this.unit_length_right = 2;
    }

    //the top row is not used: the decoration is drawn a bit above its cells (the .075 below),
    //so there it would go into the ceiling
    maxForward(){
        return 6;
    }

    //on the back wall it is also drawn half a cell to the right (the .11 below), so the last
    //column would go into the right wall; on the side walls it is centred on its cells
    maxRight(){
        return this.platform == back_wall ? 6 : 7;
    }

    //hang it on another wall, at the same height, still inside the wall
    moveToWall(wall){
        this.platform = wall;
        this.pos_forward = Math.min(this.pos_forward, this.maxForward() - this.unit_length_forward + 1);
        this.pos_right = Math.min(this.pos_right, this.maxRight() - this.unit_length_right + 1);
    }

    moveToPlace(){
        let wall = this.platform;
        let height = wall.position.y + ((this.pos_forward - 3)*2-1) * wall.size.y / 8;
        if (wall == back_wall){
            //just in front of the back wall
            M.move(wall.position.x + ((this.pos_right - 3)*2-1) * wall.size.x / 8, height, -.68);
            M.move(.11, .075, wall.size.z / 8);
        } else {
            //side walls: centred on its cells along the wall, the same distance in front of the wall
            //and the same height as on the back wall, turned to face into the room
            let along = ((this.pos_right - 3)*2-1) * wall.size.z / 8 + (this.unit_length_right - 1) * wall.size.z / 8;
            let into_room = wall == left_wall ? 1 : -1; //+x from the left wall, -x from the right wall
            M.move(wall.position.x + into_room * (wall.size.x + .0225), height, wall.position.z - into_room * along);
            M.move(0, .075, 0);
            M.turnY(into_room * Math.PI / 2);
        }
        M.scale(this.model_scale);
        M.turnX(Math.PI/2);
        //after turnX the turn goes the other way round than on the floor,
        //so use the opposite angle to keep the arrows pointing where the item moves
        M.turnY(-FACE_ANGLE[this.facing()]);
    }

    drawArrows(){
        M.S().move(0, .35, -.08).scale(.02,.02,.08).draw(Cube(), [1, 0, 0], 1).R();
        M.S().move(.1, .35, .02).scale(.08,.02,.02).draw(Cube(), [0, 0, 1], 1).R();
    }
}

class Television extends FloorFurniture {
    constructor(){
        super();
        this.is_small_thing = true;
    }

    drawModel(){
        let TvBackBoxPos = { x: 0, y: 0, z: 0 };
        let TvBackBoxSize = { x: 0.3, y: 0.3, z: 0.2 };
        //Blocks
        let blocks = [
            {
                position: { x: 0, y: 0.28, z: 0.23 },
                size: { x: 0.26, y: 0.02, z: 0.03 }
            }, //Up Wall
            {
                position: { x: 0, y: -0.28, z: 0.23 },
                size: { x: 0.26, y: 0.02, z: 0.03 }
            }, //Down Wall
            {
                position: { x: 0.28, y: 0, z: 0.23 },
                size: { x: 0.02, y: 0.3, z: 0.03 }
            }, //Right Wall
            {
                position: { x: -0.28, y: 0, z: 0.23 },
                size: { x: 0.02, y: 0.3, z: 0.03 }
            } //Left Wall
        ];

        let buttons = [
            (0.01, 0.01, 0.01),
            (0.01, 0.01, 0.01),
        ]

        M.S().move(TvBackBoxPos.x, TvBackBoxPos.y, TvBackBoxPos.z)
            .scale(TvBackBoxSize.x, TvBackBoxSize.y, TvBackBoxSize.z)
            .draw(Cube(), [.5, .5, .5], 1, 12, -1)
            .R();
        // Draw the blocks
        for (let block of blocks) {
            M.S().move(block.position.x, block.position.y, block.position.z)
                .scale(block.size.x, block.size.y, block.size.z)
                .draw(Cube(), [1, 1, 1], 1, 12, -1)
                .R();
        }
        //Draw the button on down wall
        M.S().move(blocks[1].position.x + .15, blocks[1].position.y, blocks[1].position.z + .03);
        M.S().scale(buttons[0]).draw(Cube(), [1, 0.5, 0.5], 1);
        M.R();
        M.S().move(.05, 0, 0);
        M.scale(buttons[1]).draw(Cube(), [0.5, 0.5, 1], 1);
        M.R();
        M.R();

        //Draw the screen
        // M.S().move(0, 0, 0.22).scale(0.255, 0.255, 0.02).draw(Cube(), [1, 1, 1], 1, cur_frame).R();
        M.S().move(0, 0, 0.22).scale(0.255, 0.255, 0.02).draw(Cube(), [.3, .3, .3], 1).R();
    }
}

class Chair extends FloorFurniture {
    drawModel(){
        let seat = {
            size: { x: .3, y: .05, z: .3 },
            position:{ x: 0, y: 0, z: 0 },
        }
        let back = {
            size: { x: .04, y: .36, z: .3 },
            position:{ x: .35, y: .4, z: 0 },
        }
        let leg = {
            size: { x: .06, y: .06, z: .2 },
            position:{ x: 0, y: 0, z: .25 },
        }

        M.S().move(seat.position.x, seat.position.y, seat.position.z);
            M.S();
                M.scale(seat.size.x, seat.size.y, seat.size.z)
                .draw(Cube(), [1, 1, 1], 1, 11, -1);
            M.R();
            M.S();
                M.turnX(Math.PI / 2)
                M.move(0,0,seat.size.z);
                for(let i = -1; i < 2; i+=2){
                    M.S();
                        M.turnX(Math.PI / 12)
                        M.move(i * .15, -.2, 0);
                        M.scale(leg.size.x, leg.size.y, leg.size.z)
                        M.draw(Cylinder(20), [1, 1, 1], 1, 11, -1);
                    M.R();
                }
                for(let i = -1; i < 2; i+=2){
                    M.S();
                        M.turnX(-Math.PI / 12)
                        M.move(i * .15, .2, 0);
                        M.scale(leg.size.x, leg.size.y, leg.size.z)
                        M.draw(Cylinder(20), [1, 1, 1], 1, 11, -1);
                    M.R();
                }

            M.R();
        M.R();

        M.S().move(back.position.x, back.position.y, back.position.z)
            .turnZ(-Math.PI / 12)
            .scale(back.size.x, back.size.y, back.size.z)
            .draw(Cube(), [1, 1, 1], 1, 11, -1)
            .R();
    }
}

class Computer extends FloorFurniture {
    constructor(){
        super();
        this.is_small_thing = true;
    }

    drawModel(){
        let bottom = {
            size: { x: .2, y: .05, z: .3 },
            position:{ x: 0, y: -.3, z: 0 },
        }
        let back = {
            size: { x: .04, y: .25, z: .3 },
            position:{ x: .28, y: -.1, z: 0 },
        }

        M.S().move(bottom.position.x, bottom.position.y, bottom.position.z);
            M.S();
                M.scale(bottom.size.x, bottom.size.y, bottom.size.z)
                .draw(Cube(), [1, 1, 1], 1, 12, -1);
            M.R();
        M.R();

        M.S().move(back.position.x, back.position.y, back.position.z)
            .turnZ(-Math.PI / 15)
            .scale(back.size.x, back.size.y, back.size.z);
            M.S();
                M.scale(.9);
                M.draw(Cube(), [1, 1, 1], 1);
            M.R();
            M.move(.5, 0, 0);
            M.draw(Cube(), [1, 1, 1], 1, 12, -1);
            M.R();
    }
}

class Table extends FloorFurniture {
    constructor(){
        super();
        this.unit_length_forward = 2; // forward and backward
        this.unit_length_right = 2; // left and right
        this.is_table = true;
        this.item_on_table = [];
        this.model_scale = .28;
    }

    //the small things on the table move together with it
    shift(d_forward, d_right){
        for (let instance of this.item_on_table){
            instance.pos_forward += d_forward;
            instance.pos_right += d_right;
        }
        super.shift(d_forward, d_right);
    }

    drawModel(){
        let seat = {
            size: { x: .3, y: .05, z: .3 },
            position:{ x: 0, y: 0, z: 0 },
        }
        let leg = {
            size: { x: .06, y: .06, z: .1 },
            position:{ x: 0, y: 0, z: .25 },
        }

        M.S().move(seat.position.x, seat.position.y, seat.position.z);
            M.S();
                M.scale(seat.size.x, seat.size.y, seat.size.z)
                .draw(Cube(), [1, 1, 1], 1, 11, -1);
            M.R();
            M.S();
                M.turnX(Math.PI / 2)
                M.move(0,0,.15);
                for(let i = -1; i < 2; i+=2){
                    M.S();
                        // M.turnX(Math.PI / 12)
                        M.move(i * .15, -.2, 0);
                        M.scale(leg.size.x, leg.size.y, leg.size.z)
                        M.draw(Cylinder(20), [1, 1, 1], 1, 11, -1);
                    M.R();
                }
                for(let i = -1; i < 2; i+=2){
                    M.S();
                        // M.turnX(-Math.PI / 12)
                        M.move(i * .15, .2, 0);
                        M.scale(leg.size.x, leg.size.y, leg.size.z)
                        M.draw(Cylinder(20), [1, 1, 1], 1, 11, -1);
                    M.R();
                }

            M.R();
        M.R();
    }
}

class Bed extends FloorFurniture {
    constructor(){
        super();
        this.unit_length_forward = 2; // forward and backward
        this.pos_right = 1;
    }

    drawModel(){
        let seat = {
            size: { x: .3, y: .1, z: .55 },
            position:{ x: 0, y: -.15, z: 0 },
        }
        let leg = {
            size: { x: .06, y: .06, z: .1 },
            position:{ x: 0, y: 0, z: .25 },
        }

        M.S().move(seat.position.x, seat.position.y, seat.position.z);
            M.S();
                M.scale(seat.size.x, seat.size.y, seat.size.z)
                .draw(Cube(), [1, 1, 1], 1, 10, -1);
            M.R();
            M.S();
                M.turnX(Math.PI / 2)
                M.move(0,0,.15);
                for(let i = -1; i < 2; i+=2){
                    M.S();
                        // M.turnX(Math.PI / 12)
                        M.move(i * .22, -.45, 0);
                        M.scale(leg.size.x, leg.size.y, leg.size.z)
                        M.draw(Cylinder(20), [1, 1, 1], 1, 11, -1);
                    M.R();
                }
                for(let i = -1; i < 2; i+=2){
                    M.S();
                        // M.turnX(-Math.PI / 12)
                        M.move(i * .22, .45, 0);
                        M.scale(leg.size.x, leg.size.y, leg.size.z)
                        M.draw(Cylinder(20), [1, 1, 1], 1, 11, -1);
                    M.R();
                }

            M.R();
            //pillow
            M.S().move(0, .05, -.3);
                M.scale(.2,.1,.1).draw(Cube(), [1, 1, 1]);
            M.R();

            //blanket
            M.S().move(0, .1, .15);
                M.scale(.25,.01,.4).draw(Cube(), [1, 1, 1]);
            M.R();
        M.R();
    }
}

class Sofa extends FloorFurniture {
    constructor(){
        super();
        this.pos_forward = 6;
        this.pos_right = 3;
        this.setFacing('right');
    }

    drawModel(){
        let seat = {
            size: { x: .3, y: .25, z: .3 },
            position:{ x: 0, y: -.2, z: 0 },
        }
        let back = {
            size: { x: .04, y: .36, z: .3 },
            position:{ x: .35, y: .4, z: 0 },
        }

        M.S().move(seat.position.x, seat.position.y, seat.position.z);
            M.S();
                M.scale(seat.size.x, seat.size.y, seat.size.z)
                .turnX(Math.PI / 2)
                .draw(Cylinder(20), [1, 1, 1], 1, 10, -1);
            M.R();
        M.R();

        M.S().move(back.position.x, back.position.y, back.position.z)
            .turnY(-Math.PI /2).turnX(-Math.PI/12)
            // .scale(back.size.x, back.size.y, back.size.z)
            .scale(.3, .3, .3)
            .draw(Torus(20,.5,10), [1, 1, 1], 1, 9, -1)
            .R();

        //arm rest
        M.S().move(-.1, .1, -.25)
            .scale(.3, .1, .1)
            .draw(Sphere(20), [1,1,1], 1, 9, -1)
            .R();

        M.S().move(-.1, .1, .25)
            .scale(.3, .1, .1)
            .draw(Sphere(20), [1,1,1], 1, 9, -1)
            .R();
    }
}

class Painting extends WallDecoration {
    constructor(){
        super();
        this.texture_ = Math.floor(Math.random() * 4);
        this.model_scale = .28;
    }

    drawModel(){
        // let seat = {
        //     size: { x: .3, y: .1, z: .55 },
        //     position:{ x: 0, y: -.15, z: 0 },
        // }
        // let leg = {
        //     size: { x: .06, y: .06, z: .1 },
        //     position:{ x: 0, y: 0, z: .25 },
        // }

        M.S().move(0, 0, 0)
            .turnX(Math.PI / 2)
            .scale(.3, .3, .01)
            .draw(Cube(), [0,0,0], 1);
            M.move(0,0,-.3).scale(.9);
            M.draw(Cube(), [1, 1, 1], 1, this.texture_,-1);
        M.R();

        // M.S().move(0, .1, -.08).scale(.03,.02,.08).draw(Cube(), [0, 0, 0], 1).R();
        // M.S().move(.1, .1, .02).scale(.08,.02,.02).draw(Cube(), [0, 0, 0], 1).R();

        // M.S().move(seat.position.x, seat.position.y, seat.position.z);
        //     M.S();
        //         M.scale(seat.size.x, seat.size.y, seat.size.z)
        //         .draw(Cube(), [1, 1, 1], 1, 10, -1);
        //     M.R();
        //     M.S();
        //         M.turnX(Math.PI / 2)
        //         M.move(0,0,.15);
        //         for(let i = -1; i < 2; i+=2){
        //             M.S();
        //                 // M.turnX(Math.PI / 12)
        //                 M.move(i * .22, -.45, 0);
        //                 M.scale(leg.size.x, leg.size.y, leg.size.z)
        //                 M.draw(Cylinder(20), [1, 1, 1], 1, 11, -1);
        //             M.R();
        //         }
        //         for(let i = -1; i < 2; i+=2){
        //             M.S();
        //                 // M.turnX(-Math.PI / 12)
        //                 M.move(i * .22, .45, 0);
        //                 M.scale(leg.size.x, leg.size.y, leg.size.z)
        //                 M.draw(Cylinder(20), [1, 1, 1], 1, 11, -1);
        //             M.R();
        //         }
                
        //     M.R();
        //     //pillow
        //     M.S().move(0, .05, -.3);
        //         M.scale(.2,.1,.1).draw(Cube(), [1, 1, 1]);
        //     M.R();

        //     //blanket
        //     M.S().move(0, .1, .15);
        //         M.scale(.25,.01,.4).draw(Cube(), [1, 1, 1]);
        //     M.R();
        // M.R();
    }
}

class Clock extends WallDecoration {
    drawModel(){
        // let seat = {
        //     size: { x: .3, y: .1, z: .55 },
        //     position:{ x: 0, y: -.15, z: 0 },
        // }
        // let leg = {
        //     size: { x: .06, y: .06, z: .1 },
        //     position:{ x: 0, y: 0, z: .25 },
        // }

        M.S().move(0, 0, 0)
            .turnX(Math.PI / 2)
            .scale(.3, .3, .1)
            .draw(Cylinder(20), [1, 1, 1], 1);
        M.R();

        M.S().move(0, .1, -.08).scale(.03,.02,.08).draw(Cube(), [0, 0, 0], 1).R();
        M.S().move(.1, .1, .02).scale(.08,.02,.02).draw(Cube(), [0, 0, 0], 1).R();

        // M.S().move(seat.position.x, seat.position.y, seat.position.z);
        //     M.S();
        //         M.scale(seat.size.x, seat.size.y, seat.size.z)
        //         .draw(Cube(), [1, 1, 1], 1, 10, -1);
        //     M.R();
        //     M.S();
        //         M.turnX(Math.PI / 2)
        //         M.move(0,0,.15);
        //         for(let i = -1; i < 2; i+=2){
        //             M.S();
        //                 // M.turnX(Math.PI / 12)
        //                 M.move(i * .22, -.45, 0);
        //                 M.scale(leg.size.x, leg.size.y, leg.size.z)
        //                 M.draw(Cylinder(20), [1, 1, 1], 1, 11, -1);
        //             M.R();
        //         }
        //         for(let i = -1; i < 2; i+=2){
        //             M.S();
        //                 // M.turnX(-Math.PI / 12)
        //                 M.move(i * .22, .45, 0);
        //                 M.scale(leg.size.x, leg.size.y, leg.size.z)
        //                 M.draw(Cylinder(20), [1, 1, 1], 1, 11, -1);
        //             M.R();
        //         }
                
        //     M.R();
        //     //pillow
        //     M.S().move(0, .05, -.3);
        //         M.scale(.2,.1,.1).draw(Cube(), [1, 1, 1]);
        //     M.R();

        //     //blanket
        //     M.S().move(0, .1, .15);
        //         M.scale(.25,.01,.4).draw(Cube(), [1, 1, 1]);
        //     M.R();
        // M.R();
    }
}

//------------------------------------------------------------
//save / load / reset / clear the room
//------------------------------------------------------------
const SAVE_KEY = 'mine-decorating-room';
const SAVE_VERSION = 1;
//the names addItem() uses
const FURNITURE_TYPES = {
    television: Television,
    chair: Chair,
    computer: Computer,
    table: Table,
    bed: Bed,
    sofa: Sofa,
    painting: Painting,
    clock: Clock,
};
const PLATFORMS = {
    floor: floor,
    back_wall: back_wall,
    left_wall: left_wall,
    right_wall: right_wall,
};

let nameIn = (map, value) => Object.keys(map).find(key => map[key] === value);

let cellsFree = (item) => {
    let condi = platformCondi(item.platform);
    for (let i = item.pos_forward; i < item.pos_forward + item.unit_length_forward; i++){
        for (let j = item.pos_right; j < item.pos_right + item.unit_length_right; j++){
            if (condi[i][j] != 0){
                return false;
            }
        }
    }
    return true;
}

//the room as plain data (on_table is the index of the table a small thing stands on)
let roomData = () => {
    let items = allInstance.concat(wallInstance);
    return {
        version: SAVE_VERSION,
        items: items.map(item => {
            let data = {
                type: nameIn(FURNITURE_TYPES, item.constructor),
                platform: nameIn(PLATFORMS, item.platform),
                pos_forward: item.pos_forward,
                pos_right: item.pos_right,
                unit_length_forward: item.unit_length_forward,
                unit_length_right: item.unit_length_right,
                red_face: item.facing(),
            };
            if (item.is_placed_on_table){
                data.on_table = items.indexOf(item.placing_table);
            }
            if (item.texture_ !== undefined){
                data.texture_ = item.texture_;
            }
            return data;
        }),
    };
}

//save every item to localStorage
//returns 'saved', 'not_placed' (the item being edited cannot stay where it is) or 'unavailable'
let saveRoom = () => {
    if (selectedInstance != null && !stopChangeItem()){
        return 'not_placed';
    }
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(roomData()));
        return 'saved';
    } catch (e) {
        return 'unavailable';
    }
}

//rebuild the room from roomData(), including the taken cells and what stands on which table
//throws if the data is not a valid room
let restoreRoom = (data) => {
    clearRoom();
    if (!data || data.version !== SAVE_VERSION || !Array.isArray(data.items)){
        throw new Error('unknown save format');
    }
    let items = data.items.map(d => {
        let Type = FURNITURE_TYPES[d.type];
        let platform = PLATFORMS[d.platform];
        if (!Type || !platform){
            throw new Error('unknown item or platform');
        }
        let item = new Type();
        //decorations hang on a wall, everything else stands on the floor
        if ((item instanceof WallDecoration) == (platform == floor)){
            throw new Error('item on the wrong platform');
        }
        //its own lengths, maybe swapped by turning it
        let f = item.unit_length_forward, r = item.unit_length_right;
        if (!(d.unit_length_forward === f && d.unit_length_right === r) &&
            !(d.unit_length_forward === r && d.unit_length_right === f)){
            throw new Error('wrong size');
        }
        if (!FACES.includes(d.red_face)){
            throw new Error('unknown facing');
        }
        item.platform = platform;
        item.pos_forward = d.pos_forward;
        item.pos_right = d.pos_right;
        item.unit_length_forward = d.unit_length_forward;
        item.unit_length_right = d.unit_length_right;
        item.setFacing(d.red_face);
        if (!item.fits()){
            throw new Error('outside the platform');
        }
        if (item instanceof Painting){
            if (![0, 1, 2, 3].includes(d.texture_)){
                throw new Error('unknown painting');
            }
            item.texture_ = d.texture_;
        }
        item.is_under_editing = false;
        return item;
    });

    //take the cells: first everything that is not a small thing (tables included),
    //then the small things, which may stand on a table
    let order = items.map((item, i) => i);
    order.sort((a, b) => items[a].is_small_thing - items[b].is_small_thing);
    for (let i of order){
        let item = items[i];
        let on_table = data.items[i].on_table;
        if (on_table === undefined || on_table === null){
            if (!cellsFree(item)){
                throw new Error('items overlap');
            }
            setCells(item, 1);
            continue;
        }
        let table = Number.isInteger(on_table) ? items[on_table] : undefined;
        if (!item.is_small_thing || !table || !table.is_table ||
            item.pos_forward < table.pos_forward || item.pos_right < table.pos_right ||
            item.pos_forward + item.unit_length_forward > table.pos_forward + table.unit_length_forward ||
            item.pos_right + item.unit_length_right > table.pos_right + table.unit_length_right ||
            table.item_on_table.some(t => t.pos_forward == item.pos_forward && t.pos_right == item.pos_right)){
            throw new Error('not a free spot on a table');
        }
        table.item_on_table.push(item);
        item.is_placed_on_table = true;
        item.placing_table = table;
    }
    //same order as when saved
    for (let item of items){
        if (item instanceof WallDecoration){
            wallInstance.push(item);
        } else {
            allInstance.push(item);
        }
    }
}

//load the saved room; returns false (and leaves the room empty) when there is none or it is broken
let loadRoom = () => {
    let text = null;
    try {
        text = localStorage.getItem(SAVE_KEY);
    } catch (e) {
        return false;
    }
    if (!text){
        return false;
    }
    try {
        restoreRoom(JSON.parse(text));
        return true;
    } catch (e) {
        console.warn('The saved room could not be loaded:', e);
        clearRoom();
        return false;
    }
}

//remove every item and free every cell (the save is not touched)
let clearRoom = () => {
    for (let item of allInstance.concat(wallInstance)){
        item.visible = false;
    }
    allInstance.length = 0;
    wallInstance.length = 0;
    selectedInstance = null;
    for (let condi of [floor_condi, left_wall_condi, right_wall_condi, back_wall_condi]){
        for (let row of condi){
            row.fill(0);
        }
    }
    selectPlatform(no_platform);
}

//the room the game starts with when there is no save
let buildDefaultRoom = () => {
    addItem('television');
    moveItem('red');
    moveItem('blue');
    moveItem('blue');
    stopChangeItem();

    addItem('chair');
    moveItem('red');
    moveItem('red');
    moveItem('red');
    moveItem('red');
    moveItem('red');
    moveItem('blue');
    moveItem('blue');
    moveItem('blue');
    moveItem('blue');
    moveItem('blue');
    stopChangeItem();

    addItem('chair');
    moveItem('red');
    moveItem('red');
    moveItem('red');
    moveItem('red');
    moveItem('blue');
    moveItem('blue');
    rotateItem('red');
    rotateItem('red');
    stopChangeItem();

    addItem('table');
    moveItem('red');
    moveItem('red');
    moveItem('red');
    moveItem('red');
    moveItem('blue');
    moveItem('blue');
    moveItem('blue');
    stopChangeItem();

    addItem('computer');
    moveItem('red');
    moveItem('red');
    moveItem('red');
    moveItem('red');
    moveItem('blue');
    moveItem('blue');
    moveItem('blue');
    stopChangeItem();

    addItem('bed');
    moveItem('blue');
    moveItem('blue');
    moveItem('blue');
    moveItem('blue');
    moveItem('blue');
    stopChangeItem();



    addItem('clock');
    moveItem('blue');
    moveItem('blue');
    moveItem('red');
    moveItem('red');
    moveItem('red');
    moveItem('red');
    stopChangeItem();

    // addItem("sofa")
    // addItem('painting');
    // stopChangeItem();
}

let resetRoom = () => {
    clearRoom();
    buildDefaultRoom();
}

function drawBasicRoom(unSelectedColor = [.2, .2, .3], selectedColor = [.7, .1, .1]) {

    if (floor.visible) {
        if (!floor.platform_selected){
            //floor (whole)
            M.S()
                .move(floor.position.x, floor.position.y, floor.position.z)
                // .turnX(Math.PI / 2)
                .scale(floor.size.x, floor.size.y, floor.size.z)
                .draw(Cube(), unSelectedColor, 1)
            M.R();
        } else {
            //floor (8 * 8)
            for (let i = -7; i < 9; i += 2) {
                for (let j = -7; j < 9; j += 2) {
                    M.S()
                        .move(
                            floor.position.x + j * floor.size.x / 8, 
                            floor.position.y, 
                            floor.position.z + i * floor.size.z / 8
                        )
                        .scale(floor.size.x / 8, floor.size.y, floor.size.z / 8)
                        // .draw(Cube(), [0.5, 0.5, 0.5], 1)
                        .scale(.98) //leave some room between blocks to indicate the grid
                        .draw(Cube(), selectedColor, 1)
                    M.R();
                }
            }
        }
    }

    //wall (left and right)
    
    if (left_wall.visible) {
        if (!left_wall.platform_selected){
            M.S()
                .move(left_wall.position.x, left_wall.position.y, left_wall.position.z)
                // .turnX(Math.PI / 2)
                .scale(left_wall.size.x, left_wall.size.y, left_wall.size.z)
                .draw(Cube(), unSelectedColor, 1)
            M.R();
        } else {
            for (let i = -7; i < 9; i += 2) {
                for (let j = -7; j < 9; j += 2) {
                    M.S()
                        .move(
                            left_wall.position.x, 
                            left_wall.position.y + i * left_wall.size.y / 8, 
                            left_wall.position.z + j * left_wall.size.z / 8
                        )
                        .scale(left_wall.size.x, left_wall.size.y / 8, left_wall.size.z / 8)
                        .scale(.98) //leave some room between blocks to indicate the grid
                        .draw(Cube(), selectedColor, 1)
                    M.R();
                }
            }
        }
    }

    if (right_wall.visible) {
        if (!right_wall.platform_selected){
            M.S()
                .move(right_wall.position.x, right_wall.position.y, right_wall.position.z)
                // .turnX(Math.PI / 2)
                .scale(right_wall.size.x, right_wall.size.y, right_wall.size.z)
                .draw(Cube(), unSelectedColor, 1)
            M.R();
        } else {
            for (let i = -7; i < 9; i += 2) {
                for (let j = -7; j < 9; j += 2) {
                    M.S()
                        .move(
                            right_wall.position.x, 
                            right_wall.position.y + i * right_wall.size.y / 8, 
                            right_wall.position.z + j * right_wall.size.z / 8
                        )
                        .scale(right_wall.size.x, right_wall.size.y / 8, right_wall.size.z / 8)
                        .scale(.98) //leave some room between blocks to indicate the grid
                        .draw(Cube(), selectedColor, 1)
                    M.R();
                }
            }
        }
    }

    //wall (only back)

    if (back_wall.visible) {
        if (!back_wall.platform_selected){
            M.S()
                .move(back_wall.position.x, back_wall.position.y, back_wall.position.z)
                // .turnX(Math.PI / 2)
                .scale(back_wall.size.x, back_wall.size.y, back_wall.size.z)
                .draw(Cube(), unSelectedColor, 1)
            M.R();
        } else {
            for (let i = -7; i < 9; i += 2) {
                for (let j = -7; j < 9; j += 2) {
                    M.S()
                        .move(
                            back_wall.position.x + j * back_wall.size.x / 8, 
                            back_wall.position.y + i * back_wall.size.y / 8, 
                            back_wall.position.z
                        )
                        .scale(back_wall.size.x / 8, back_wall.size.y / 8, back_wall.size.z)
                        .scale(.98) //leave some room between blocks to indicate the grid
                        .draw(Cube(), selectedColor, 1)
                    M.R();
                }
            }
        }
    }

    //celling (cannot be selected)
    if (celling.visible) {
        M.S()
            .move(celling.position.x, celling.position.y, celling.position.z)
            // .turnX(Math.PI / 2)
            .scale(celling.size.x, celling.size.y, celling.size.z)
            .draw(Cube(), [1,1,1], 1)
        M.R();
    }
}

function drawAllInstance(){
    for (let instance of allInstance){
        instance.draw();
    } 
    for (let instance of wallInstance){
        //a hidden wall hides what hangs on it (except the decoration being edited)
        if (instance.platform.visible || instance.is_under_editing){
            instance.draw();
        }
    }
}

function addItem(item){
    //a new decoration goes on the selected side wall, otherwise on the back wall
    let wall = (selectedPlatform == left_wall || selectedPlatform == right_wall) ? selectedPlatform : null;
    if(selectedInstance != null){
        //stop editing the previous one
        let can_be_added = stopChangeItem();
        if (!can_be_added){
            deleteItem();
        }
    }
    if (item == 'television'){
        allInstance.push(new Television());
        selectedInstance = allInstance[allInstance.length - 1];
    }
    if (item == 'chair'){
        allInstance.push(new Chair());
        selectedInstance = allInstance[allInstance.length - 1];
    }
    if (item == 'computer'){
        allInstance.push(new Computer());
        selectedInstance = allInstance[allInstance.length - 1];
    }
    if (item == 'table'){
        allInstance.push(new Table());
        selectedInstance = allInstance[allInstance.length - 1];
    }

    if (item == 'bed'){
        allInstance.push(new Bed());
        selectedInstance = allInstance[allInstance.length - 1];
    }

    if (item == 'painting'){
        wallInstance.push(new Painting());
        selectedInstance = wallInstance[wallInstance.length - 1];
    }
    if (item == 'clock'){
        wallInstance.push(new Clock());
        selectedInstance = wallInstance[wallInstance.length - 1];
    }
    if (item == 'sofa'){
        allInstance.push(new Sofa());
        selectedInstance = allInstance[allInstance.length - 1];
    }
    if (wall != null && selectedInstance instanceof WallDecoration){
        selectedInstance.moveToWall(wall);
    }
    

}


//useless
function drawTelevision(){
    let TvBackBoxPos = { x: 0, y: 0, z: 0 };
    let TvBackBoxSize = { x: 0.3, y: 0.3, z: 0.2 };
    //Blocks
    let blocks = [
        {
            position: { x: 0, y: 0.28, z: 0.23 },
            size: { x: 0.26, y: 0.02, z: 0.03 }
        }, //Up Wall
        {
            position: { x: 0, y: -0.28, z: 0.23 },
            size: { x: 0.26, y: 0.02, z: 0.03 }
        }, //Down Wall
        {
            position: { x: 0.28, y: 0, z: 0.23 },
            size: { x: 0.02, y: 0.3, z: 0.03 }
        }, //Right Wall
        {
            position: { x: -0.28, y: 0, z: 0.23 },
            size: { x: 0.02, y: 0.3, z: 0.03 }
        } //Left Wall
    ];

    let buttons = [
        (0.01, 0.01, 0.01),
        (0.01, 0.01, 0.01),
    ]

    function play() {
        if (!playing) {
            audio.play();
            playing = true;
            setInterval(function () {
                cur_frame = (cur_frame + 1) % 12;
            }, 200);
            buttons[1] = (0.01, 0.01, 0.009);
        }
    }
    M.S().move(TvBackBoxPos.x, TvBackBoxPos.y, TvBackBoxPos.z)
        .scale(TvBackBoxSize.x, TvBackBoxSize.y, TvBackBoxSize.z)
        .draw(Cube(), [.5, .5, .5], 1, 12, -1)
        .R();
    // Draw the blocks
    for (let block of blocks) {
        M.S().move(block.position.x, block.position.y, block.position.z)
            .scale(block.size.x, block.size.y, block.size.z)
            .draw(Cube(), [1, 1, 1], 1, 12, -1)
            .R();
    }
    //Draw the button on down wall
    M.S().move(blocks[1].position.x + .15, blocks[1].position.y, blocks[1].position.z + .03);
    M.S().scale(buttons[0]).draw(Cube(), [1, 0, 0], 1);
    M.R();
    M.S().move(.05, 0, 0);
    M.scale(buttons[1]).draw(Cube(), [0, 0, 1], 1);
    M.R();
    M.R();

    //Draw the screen
    // M.S().move(0, 0, 0.22).scale(0.255, 0.255, 0.02).draw(Cube(), [1, 1, 1], 1, cur_frame).R();
    M.S().move(0, 0, 0.22).scale(0.255, 0.255, 0.02).draw(Cube(), [.3, .3, .3], 1).R();
}
