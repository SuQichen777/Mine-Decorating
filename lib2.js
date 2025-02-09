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
floor_condi = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
]
left_wall_condi = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
]

right_wall_condi = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
]

back_wall_condi = [
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

let selectItem = () => {
    if (mode == 'view'){
        return
    }
    if (selectedInstance != null){
        //clear the selected place

        let index = allInstance.indexOf(selectedInstance);
        can_be_added = stopChangeItem();
        if (!can_be_added){
            deleteItem();
        }
        // console.log(index);
        index += 1;
        // console.log(index);
        if (index >= allInstance.length){
            index = 0;
        }
        selectedInstance = allInstance[index];
    } else {
        if (allInstance.length > 0){
            index = 0;
            selectedInstance = allInstance[0];
        }
    }
    if (selectedInstance.platform == back_wall){
        for (let i = selectedInstance.pos_forward; i < selectedInstance.pos_forward + selectedInstance.unit_length_forward; i++){
            console.log("i: ", i);
            for (let j = selectedInstance.pos_right; j < selectedInstance.pos_right + selectedInstance.unit_length_right; j++){
                console.log("j: ", j);
                console.table(floor_condi);
                floor_condi[i][j] = 0;
                console.table(floor_condi);
            }
        }
        selectedInstance.is_under_editing = true;
    }

    if (selectedInstance.platform == floor){
        console.log("Selected Index", index);
        console.log("Right Pos: ",selectedInstance.pos_right);
        console.log("Right Length: ",selectedInstance.unit_length_right);
        console.log("Forward Pos: ",selectedInstance.pos_forward);
        console.log("Forward Length: ",selectedInstance.unit_length_forward);

        if (selectedInstance.is_small_thing){
            if (selectedInstance.is_placed_on_table){
            } else {
                for (let i = selectedInstance.pos_forward; i < selectedInstance.pos_forward + selectedInstance.unit_length_forward; i++){
                    console.log("i: ", i);
                    for (let j = selectedInstance.pos_right; j < selectedInstance.pos_right + selectedInstance.unit_length_right; j++){
                        console.log("j: ", j);
                        console.table(floor_condi);
                        floor_condi[i][j] = 0;
                        console.table(floor_condi);
                    }
                }
            }
        }
        else {
            for (let i = selectedInstance.pos_forward; i < selectedInstance.pos_forward + selectedInstance.unit_length_forward; i++){
                console.log("i: ", i);
                for (let j = selectedInstance.pos_right; j < selectedInstance.pos_right + selectedInstance.unit_length_right; j++){
                    console.log("j: ", j);
                    console.table(floor_condi);
                    floor_condi[i][j] = 0;
                    console.table(floor_condi);
                }
            }
        }
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

    flag = true;
    overlapping = false;
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
        if (selectedInstance.platform == left_wall){
            let x = selectedInstance.pos_right;
            let y = selectedInstance.pos_forward;
            for (let i = x; i < x + selectedInstance.unit_length_right; i++){
                for (let j = y; j < y + selectedInstance.unit_length_forward; j++){
                    if (left_wall_condi[j][i] == 1){
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
        if (selectedInstance.platform == right_wall){
            let x = selectedInstance.pos_right;
            let y = selectedInstance.pos_forward;
            for (let i = x; i < x + selectedInstance.unit_length_right; i++){
                for (let j = y; j < y + selectedInstance.unit_length_forward; j++){
                    if (right_wall_condi[j][i] == 1){
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
        if (selectedInstance.platform == back_wall){
            let x = selectedInstance.pos_right;
            let y = selectedInstance.pos_forward;
            for (let i = x; i < x + selectedInstance.unit_length_right; i++){
                for (let j = y; j < y + selectedInstance.unit_length_forward; j++){
                    if (back_wall_condi[j][i] == 1){
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


        //set platform condition
        //where the object is placed, set the condition to 1
        for (let i = 0; i < selectedInstance.unit_length_right; i++){
            for (let j = 0; j < selectedInstance.unit_length_forward; j++){
                if (selectedInstance.platform == floor){
                    floor_condi[selectedInstance.pos_forward + j][selectedInstance.pos_right + i] = 1;
                } else if (selectedInstance.platform == left_wall){
                    left_wall_condi[selectedInstance.pos_forward + j][selectedInstance.pos_right + i] = 1;
                } else if (selectedInstance.platform == right_wall){
                    right_wall_condi[selectedInstance.pos_forward + j][selectedInstance.pos_right + i] = 1;
                } else if (selectedInstance.platform == back_wall){
                    back_wall_condi[selectedInstance.pos_forward + j][selectedInstance.pos_right + i] = 1;
                }
            }
        }
        //cosole log floor
        // for (let i = 0; i < floor_condi.length; i++){
        //     console.log(floor_condi[i]);
        // }

        //if flag is true, then stop editing
        if (flag){
            selectedInstance.is_under_editing = false;
            selectedInstance = null;
        }
        return flag;
    }
}

let deleteItem = () => {
    if (mode == 'view'){
        return
    }
    if (selectedInstance != null){
        selectedInstance.visible = false;
        let index = allInstance.indexOf(selectedInstance);
        allInstance.splice(index, 1);
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

class Television {
    constructor(){
        this.platform = floor;
        this.unit_length_forward = 1; // forward and backward
        this.unit_length_right = 1; // left and right
        this.pos_forward = 0;
        this.pos_right = 0;
        this.can_rotate = true;
        this.visible = true;
        this.is_small_thing = true;
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
    }

    moveRed(){
        // this.is_placed_on_table = false;
        if (this.red_face.forward){
            if (this.pos_forward + this.unit_length_forward - 1 < 7){
                this.pos_forward += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                this.pos_forward -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_right + this.unit_length_right -1 < 7){
                this.pos_right += 1;
            }
        } else if (this.red_face.left){
            if (this.pos_right - this.unit_length_right + 1> 0){
                this.pos_right -= 1;
            }
        }
    }

    moveBlue(){
        // this.is_placed_on_table = false;
        if (this.red_face.forward){
            if (this.pos_right + this.unit_length_right -1 < 7){
                this.pos_right += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_right - this.unit_length_right + 1 > 0){
                this.pos_right -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                this.pos_forward -= 1;
            }
        } else if (this.red_face.left){
            if (this.pos_forward + this.unit_length_forward - 1 < 7){
                this.pos_forward += 1;
            }
        }
    }


    rotateBlue(){
        if (
            this.pos_forward - this.unit_length_right + 1 < 0 ||
            // this.pos_right - this.unit_length_forward + 1 < 0 ||
            // this.pos_forward + this.unit_length_right - 1 > 7 ||
            this.pos_right+ this.unit_length_forward - 1 > 7
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.forward = true;
            }
        }
    }

    rotateRed(){
        if (
            // this.pos_forward - this.unit_length_right + 1 < 0 ||
            this.pos_right - this.unit_length_forward + 1 < 0 ||
            this.pos_forward + this.unit_length_right - 1 > 7
            // this.pos_right+ this.unit_length_forward - 1 > 7
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.forward = true;
            }
        }
    }

    draw(){
        if (this.visible)
        {
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
            M.S();

            //change to specific position
            M.move(floor.position.x + ((this.pos_right - 3)*2-1) * floor.size.x / 8,
                 -.43 ,
                 floor.position.z + ((this.pos_forward - 3)*2-1) * floor.size.z / 8);
            M.scale(.14);
            if (this.is_placed_on_table){
                M.move(0, .42, 0);
            }

            //rotate base on red face
            if (this.red_face.forward){
                M.turnY(0);
            } else if (this.red_face.right){
                M.turnY(Math.PI / 2);
            } else if (this.red_face.backward){
                M.turnY(Math.PI);
            } else if (this.red_face.left){
                M.turnY(-Math.PI / 2);
            }

            M.S().move(TvBackBoxPos.x, TvBackBoxPos.y, TvBackBoxPos.z)
                .scale(TvBackBoxSize.x, TvBackBoxSize.y, TvBackBoxSize.z)
                .draw(Cube(), [.5, .5, .5], 1, 12, -1)
                .R();
            //draw instruction
            if (this.is_under_editing){
                selectPlatform(this.platform);
                M.S().move(0, .35, .08).scale(.02,.02,.08).draw(Cube(), [1, 0, 0], 1).R();
                M.S().move(.1, .35, .02).scale(.08,.02,.02).draw(Cube(), [0, 0, 1], 1).R();
            }
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

            M.R();
        }

    }
}

class Chair {
    constructor(){
        this.platform = floor;
        this.unit_length_forward = 1; // forward and backward
        this.unit_length_right = 1; // left and right
        this.pos_forward = 0;
        this.pos_right = 0;
        this.can_rotate = true;
        this.visible = true;
        this.is_small_thing = false;
        this.is_placed_on_table = false;
        this.is_table = false;
        this.is_under_editing = true;
        this.red_face = {
            forward: true,
            backward: false,
            left: false,
            right: false,
        }
    }

    moveRed(){
        if (this.red_face.forward){
            if (this.pos_forward + this.unit_length_forward - 1 < 7){
                this.pos_forward += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                this.pos_forward -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_right + this.unit_length_right -1 < 7){
                this.pos_right += 1;
            }
        } else if (this.red_face.left){
            if (this.pos_right - this.unit_length_right + 1> 0){
                this.pos_right -= 1;
            }
        }
    }

    moveBlue(){
        if (this.red_face.forward){
            if (this.pos_right + this.unit_length_right -1 < 7){
                this.pos_right += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_right - this.unit_length_right + 1 > 0){
                this.pos_right -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                this.pos_forward -= 1;
            }
        } else if (this.red_face.left){
            if (this.pos_forward + this.unit_length_forward - 1 < 7){
                this.pos_forward += 1;
            }
        }
    }


    rotateBlue(){
        if (
            this.pos_forward - this.unit_length_right + 1 < 0 ||
            // this.pos_right - this.unit_length_forward + 1 < 0 ||
            // this.pos_forward + this.unit_length_right - 1 > 7 ||
            this.pos_right+ this.unit_length_forward - 1 > 7
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.forward = true;
            }
        }
    }

    rotateRed(){
        if (
            // this.pos_forward - this.unit_length_right + 1 < 0 ||
            this.pos_right - this.unit_length_forward + 1 < 0 ||
            this.pos_forward + this.unit_length_right - 1 > 7
            // this.pos_right+ this.unit_length_forward - 1 > 7
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.forward = true;
            }
        }
    }

    draw(){
        if (this.visible)
        {   
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

            M.S();

            //change to specific position
            M.move(floor.position.x + ((this.pos_right - 3)*2-1) * floor.size.x / 8,
                 -.43 ,
                 floor.position.z + ((this.pos_forward - 3)*2-1) * floor.size.z / 8);
            M.scale(.14);

            //rotate base on red face
            if (this.red_face.forward){
                M.turnY(0);
            } else if (this.red_face.right){
                M.turnY(Math.PI / 2);
            } else if (this.red_face.backward){
                M.turnY(Math.PI);
            } else if (this.red_face.left){
                M.turnY(-Math.PI / 2);
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
            if (this.is_under_editing){
                selectPlatform(this.platform);
                M.S().move(0, .35, .08).scale(.02,.02,.08).draw(Cube(), [1, 0, 0], 1).R();
                M.S().move(.1, .35, .02).scale(.08,.02,.02).draw(Cube(), [0, 0, 1], 1).R();
            }

            M.S().move(back.position.x, back.position.y, back.position.z)
                .turnZ(-Math.PI / 12)
                .scale(back.size.x, back.size.y, back.size.z)
                .draw(Cube(), [1, 1, 1], 1, 11, -1)
                .R();

            M.R();
        }

    }
}

class Computer {
    constructor(){
        this.platform = floor;
        this.unit_length_forward = 1; // forward and backward
        this.unit_length_right = 1; // left and right
        this.pos_forward = 0;
        this.pos_right = 0;
        this.can_rotate = true;
        this.visible = true;
        this.is_small_thing = true;
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
    }

    moveRed(){
        // this.is_placed_on_table = false;
        if (this.red_face.forward){
            if (this.pos_forward + this.unit_length_forward - 1 < 7){
                this.pos_forward += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                this.pos_forward -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_right + this.unit_length_right -1 < 7){
                this.pos_right += 1;
            }
        } else if (this.red_face.left){
            if (this.pos_right - this.unit_length_right + 1> 0){
                this.pos_right -= 1;
            }
        }
    }

    moveBlue(){
        // this.is_placed_on_table = false;
        if (this.red_face.forward){
            if (this.pos_right + this.unit_length_right -1 < 7){
                this.pos_right += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_right - this.unit_length_right + 1 > 0){
                this.pos_right -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                this.pos_forward -= 1;
            }
        } else if (this.red_face.left){
            if (this.pos_forward + this.unit_length_forward - 1 < 7){
                this.pos_forward += 1;
            }
        }
    }


    rotateBlue(){
        if (
            this.pos_forward - this.unit_length_right + 1 < 0 ||
            // this.pos_right - this.unit_length_forward + 1 < 0 ||
            // this.pos_forward + this.unit_length_right - 1 > 7 ||
            this.pos_right+ this.unit_length_forward - 1 > 7
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.forward = true;
            }
        }
    }

    rotateRed(){
        if (
            // this.pos_forward - this.unit_length_right + 1 < 0 ||
            this.pos_right - this.unit_length_forward + 1 < 0 ||
            this.pos_forward + this.unit_length_right - 1 > 7
            // this.pos_right+ this.unit_length_forward - 1 > 7
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.forward = true;
            }
        }
    }

    draw(){
        if (this.visible)
        {   
            let bottom = {
                size: { x: .2, y: .05, z: .3 },
                position:{ x: 0, y: -.3, z: 0 },
            }
            let back = {
                size: { x: .04, y: .25, z: .3 },
                position:{ x: .28, y: -.1, z: 0 },
            }

            M.S();

            //change to specific position
            M.move(floor.position.x + ((this.pos_right - 3)*2-1) * floor.size.x / 8,
                 -.43 ,
                 floor.position.z + ((this.pos_forward - 3)*2-1) * floor.size.z / 8);
            M.scale(.14);
                if (this.is_placed_on_table){
                M.move(0, .42, 0);
            }

            //rotate base on red face
            if (this.red_face.forward){
                M.turnY(0);
            } else if (this.red_face.right){
                M.turnY(Math.PI / 2);
            } else if (this.red_face.backward){
                M.turnY(Math.PI);
            } else if (this.red_face.left){
                M.turnY(-Math.PI / 2);
            }

            M.S().move(bottom.position.x, bottom.position.y, bottom.position.z);
                M.S();
                    M.scale(bottom.size.x, bottom.size.y, bottom.size.z)
                    .draw(Cube(), [1, 1, 1], 1, 12, -1);
                M.R();
            M.R();
            if (this.is_under_editing){
                selectPlatform(this.platform);
                M.S().move(0, .35, .08).scale(.02,.02,.08).draw(Cube(), [1, 0, 0], 1).R();
                M.S().move(.1, .35, .02).scale(.08,.02,.02).draw(Cube(), [0, 0, 1], 1).R();
            }

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

            M.R();
        }

    }
}

class Table {
    constructor(){
        this.platform = floor;
        this.unit_length_forward = 2; // forward and backward
        this.unit_length_right = 2; // left and right
        this.pos_forward = 0;
        this.pos_right = 0;
        this.can_rotate = true;
        this.visible = true;
        this.is_small_thing = false;
        this.is_placed_on_table = false;
        this.is_table = true;
        this.is_under_editing = true;
        this.red_face = {
            forward: true,
            backward: false,
            left: false,
            right: false,
        }
        this.item_on_table = [];
    }

    moveRed(){
        if (this.red_face.forward){
            if (this.pos_forward + this.unit_length_forward - 1 < 7){
                for (let instance of this.item_on_table){
                    instance.pos_forward += 1;
                }
                this.pos_forward += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                for (let instance of this.item_on_table){
                    instance.pos_forward -= 1;
                }
                this.pos_forward -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_right + this.unit_length_right -1 < 7){
                for (let instance of this.item_on_table){
                    instance.pos_right += 1;
                }
                this.pos_right += 1;
            }
        } else if (this.red_face.left){
            if (this.pos_right - this.unit_length_right + 1> 0){
                for (let instance of this.item_on_table){
                    instance.pos_right -= 1;
                }  
                this.pos_right -= 1;
            }
        }
    }

    moveBlue(){
        if (this.red_face.forward){
            if (this.pos_right + this.unit_length_right -1 < 7){
                for (let instance of this.item_on_table){
                    instance.pos_right += 1;
                }
                this.pos_right += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_right - this.unit_length_right + 1 > 0){
                for (let instance of this.item_on_table){
                    instance.pos_right -= 1;
                }
                this.pos_right -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                for (let instance of this.item_on_table){
                    instance.pos_forward -= 1;
                }
                this.pos_forward -= 1;
            }
        } else if (this.red_face.left){
            if (this.pos_forward + this.unit_length_forward - 1 < 7){
                for (let instance of this.item_on_table){
                    instance.pos_forward += 1;
                }
                this.pos_forward += 1;
            }
        }
    }


    rotateBlue(){
        if (
            this.unit_length_forward != this.unit_length_right && (
            this.pos_forward - this.unit_length_right + 1 < 0 ||
            // this.pos_right - this.unit_length_forward + 1 < 0 ||
            // this.pos_forward + this.unit_length_right - 1 > 7 ||
            this.pos_right+ this.unit_length_forward - 1 > 7
            )
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            this.pos_right 
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.forward = true;
            }
        }
    }

    rotateRed(){
        if (
            this.unit_length_forward != this.unit_length_right && (
            // this.pos_forward - this.unit_length_right + 1 < 0 ||
            this.pos_right - this.unit_length_forward + 1 < 0 ||
            this.pos_forward + this.unit_length_right - 1 > 7
            // this.pos_right+ this.unit_length_forward - 1 > 7
            )
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.forward = true;
            }
        }
    }

    draw(){
        // console.log(this.pos_forward, this.pos_right);
        // console.log(this.unit_length_forward, this.unit_length_right);
        if (this.visible)
        {   
            let seat = {
                size: { x: .3, y: .05, z: .3 },
                position:{ x: 0, y: 0, z: 0 },
            }
            let leg = {
                size: { x: .06, y: .06, z: .1 },
                position:{ x: 0, y: 0, z: .25 },
            }

            M.S();

            //change to specific position
            M.move(floor.position.x + ((this.pos_right - 3)*2-1) * floor.size.x / 8,
                 -.43 ,
                 floor.position.z + ((this.pos_forward - 3)*2-1) * floor.size.z / 8);
            M.move(floor.size.x / 8, 0, floor.size.z / 8);
            M.scale(.28);

            

            //rotate base on red face
            if (this.red_face.forward){
                M.turnY(0);
            } else if (this.red_face.right){
                M.turnY(Math.PI / 2);
            } else if (this.red_face.backward){
                M.turnY(Math.PI);
            } else if (this.red_face.left){
                M.turnY(-Math.PI / 2);
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
            if (this.is_under_editing){
                selectPlatform(this.platform);
                M.S().move(0, .35, .08).scale(.02,.02,.08).draw(Cube(), [1, 0, 0], 1).R();
                M.S().move(.1, .35, .02).scale(.08,.02,.02).draw(Cube(), [0, 0, 1], 1).R();
            }

            M.R();
        }

    }
}

class Bed {
    constructor(){
        this.platform = floor;
        this.unit_length_forward = 2; // forward and backward
        this.unit_length_right = 1; // left and right
        this.pos_forward = 0;
        this.pos_right = 1;
        this.can_rotate = true;
        this.visible = true;
        this.is_small_thing = false;
        this.is_placed_on_table = false;
        this.is_table = false;
        this.is_under_editing = true;
        this.red_face = {
            forward: true,
            backward: false,
            left: false,
            right: false,
        }
        this.item_on_table = [];
    }

    moveRed(){
        if (this.red_face.forward){
            if (this.pos_forward + this.unit_length_forward - 1 < 7){
                for (let instance of this.item_on_table){
                    instance.pos_forward += 1;
                }
                this.pos_forward += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                for (let instance of this.item_on_table){
                    instance.pos_forward -= 1;
                }
                this.pos_forward -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_right + this.unit_length_right -1 < 7){
                for (let instance of this.item_on_table){
                    instance.pos_right += 1;
                }
                this.pos_right += 1;
            }
        } else if (this.red_face.left){
            if (this.pos_right - this.unit_length_right + 1> 0){
                for (let instance of this.item_on_table){
                    instance.pos_right -= 1;
                }  
                this.pos_right -= 1;
            }
        }
    }

    moveBlue(){
        if (this.red_face.forward){
            if (this.pos_right + this.unit_length_right -1 < 7){
                for (let instance of this.item_on_table){
                    instance.pos_right += 1;
                }
                this.pos_right += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_right - this.unit_length_right + 1 > 0){
                for (let instance of this.item_on_table){
                    instance.pos_right -= 1;
                }
                this.pos_right -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                for (let instance of this.item_on_table){
                    instance.pos_forward -= 1;
                }
                this.pos_forward -= 1;
            }
        } else if (this.red_face.left){
            if (this.pos_forward + this.unit_length_forward - 1 < 7){
                for (let instance of this.item_on_table){
                    instance.pos_forward += 1;
                }
                this.pos_forward += 1;
            }
        }
    }


    rotateBlue(){
        if (
            this.unit_length_forward != this.unit_length_right && (
            this.pos_forward - this.unit_length_right + 1 < 0 ||
            // this.pos_right - this.unit_length_forward + 1 < 0 ||
            // this.pos_forward + this.unit_length_right - 1 > 7 ||
            this.pos_right+ this.unit_length_forward - 1 > 7
            )
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            this.pos_right 
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.forward = true;
            }
        }
    }

    rotateRed(){
        if (
            this.unit_length_forward != this.unit_length_right && (
            // this.pos_forward - this.unit_length_right + 1 < 0 ||
            this.pos_right - this.unit_length_forward + 1 < 0 ||
            this.pos_forward + this.unit_length_right - 1 > 7
            // this.pos_right+ this.unit_length_forward - 1 > 7
            )
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.forward = true;
            }
        }
    }

    draw(){
        // console.log(this.pos_forward, this.pos_right);
        // console.log(this.unit_length_forward, this.unit_length_right);

        if (this.visible)
        {   
            let seat = {
                size: { x: .3, y: .1, z: .55 },
                position:{ x: 0, y: -.15, z: 0 },
            }
            let leg = {
                size: { x: .06, y: .06, z: .1 },
                position:{ x: 0, y: 0, z: .25 },
            }

            M.S();

            //change to specific position
            M.move(floor.position.x + ((this.pos_right - 3)*2-1) * floor.size.x / 8,
                 -.43 ,
                 floor.position.z + ((this.pos_forward - 3)*2-1) * floor.size.z / 8);
            M.move(0, 0, floor.size.z / 8);
            if (this.red_face.left){
                M.move(-floor.size.z/8, 0, -floor.size.z/8);

            } else if (this.red_face.right){
                M.move(floor.size.z/8, 0, floor.size.z/8);
            }
            M.scale(.14);


            

            //rotate base on red face
            if (this.red_face.forward){
                M.turnY(0);
            } else if (this.red_face.right){
                M.turnY(Math.PI / 2);
            } else if (this.red_face.backward){
                M.turnY(Math.PI);
            } else if (this.red_face.left){
                M.turnY(-Math.PI / 2);
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
            if (this.is_under_editing){
                selectPlatform(this.platform);
                M.S().move(0, .35, .08).scale(.02,.02,.08).draw(Cube(), [1, 0, 0], 1).R();
                M.S().move(.1, .35, .02).scale(.08,.02,.02).draw(Cube(), [0, 0, 1], 1).R();
            }

            M.R();
        }

    }
}
class Painting {
    constructor(){
        this.platform = back_wall;
        this.unit_length_forward = 2; // forward and backward
        this.unit_length_right = 2; // left and right
        this.pos_forward = 0;
        this.pos_right = 0;
        this.can_rotate = true;
        this.visible = true;
        this.is_small_thing = false;
        this.is_placed_on_table = false;
        this.is_table = false;
        this.is_under_editing = true;
        this.red_face = {
            forward: true,
            backward: false,
            left: false,
            right: false,
        }
        this.item_on_table = [];
        this.texture_ = Math.floor(Math.random() * 4);
    }

    moveRed(){
        console.log(this.pos_forward, this.pos_right);
        if (this.red_face.forward){
            if (this.pos_forward + this.unit_length_forward - 1 < 6){
                for (let instance of this.item_on_table){
                    instance.pos_forward += 1;
                }
                this.pos_forward += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                for (let instance of this.item_on_table){
                    instance.pos_forward -= 1;
                }
                this.pos_forward -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_right + this.unit_length_right -1 < 6){
                for (let instance of this.item_on_table){
                    instance.pos_right += 1;
                }
                this.pos_right += 1;
            }
        } else if (this.red_face.left){
            if (this.pos_right - this.unit_length_right + 1> 0){
                for (let instance of this.item_on_table){
                    instance.pos_right -= 1;
                }  
                this.pos_right -= 1;
            }
        }
    }

    moveBlue(){
        console.log(this.pos_forward, this.pos_right);
        if (this.red_face.forward){
            if (this.pos_right + this.unit_length_right -1 < 6){
                for (let instance of this.item_on_table){
                    instance.pos_right += 1;
                }
                this.pos_right += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_right - this.unit_length_right + 1 > 0){
                for (let instance of this.item_on_table){
                    instance.pos_right -= 1;
                }
                this.pos_right -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                for (let instance of this.item_on_table){
                    instance.pos_forward -= 1;
                }
                this.pos_forward -= 1;
            }
        } else if (this.red_face.left){
            if (this.pos_forward + this.unit_length_forward - 1 < 6){
                for (let instance of this.item_on_table){
                    instance.pos_forward += 1;
                }
                this.pos_forward += 1;
            }
        }
    }


    rotateBlue(){
        if (
            this.unit_length_forward != this.unit_length_right && (
            this.pos_forward - this.unit_length_right + 1 < 0 ||
            // this.pos_right - this.unit_length_forward + 1 < 0 ||
            // this.pos_forward + this.unit_length_right - 1 > 7 ||
            this.pos_right+ this.unit_length_forward - 1 > 7
            )
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            this.pos_right 
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.forward = true;
            }
        }
    }

    rotateRed(){
        if (
            this.unit_length_forward != this.unit_length_right && (
            // this.pos_forward - this.unit_length_right + 1 < 0 ||
            this.pos_right - this.unit_length_forward + 1 < 0 ||
            this.pos_forward + this.unit_length_right - 1 > 7
            // this.pos_right+ this.unit_length_forward - 1 > 7
            )
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.forward = true;
            }
        }
    }

    draw(){
        // console.log(this.pos_forward, this.pos_right);
        // console.log(this.unit_length_forward, this.unit_length_right);

        if (this.visible)
        {   
            // let seat = {
            //     size: { x: .3, y: .1, z: .55 },
            //     position:{ x: 0, y: -.15, z: 0 },
            // }
            // let leg = {
            //     size: { x: .06, y: .06, z: .1 },
            //     position:{ x: 0, y: 0, z: .25 },
            // }

            M.S();

            //change to specific position
            M.move(this.platform.position.x + ((this.pos_right - 3)*2-1) * this.platform.size.x / 8,
                this.platform.position.y + ((this.pos_forward - 3)*2-1) * this.platform.size.y / 8,
                -.68);
            M.move(.11, .075, this.platform.size.z / 8);
            

            if (this.platform == right_wall){
                M.turnZ(Math.PI/2);
            } else if (this.platform == left_wall){
                M.turnZ(-Math.PI/2);
            }
            M.scale(.28);
            M.turnX(Math.PI/2);
            

            //rotate base on red face
            if (this.red_face.forward){
                M.turnY(0);
            } else if (this.red_face.right){
                M.turnY(Math.PI / 2);
            } else if (this.red_face.backward){
                M.turnY(Math.PI);
            } else if (this.red_face.left){
                M.turnY(-Math.PI / 2);
            }

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
            if (this.is_under_editing){
                selectPlatform(this.platform);
                M.S().move(0, .35, -.08).scale(.02,.02,.08).draw(Cube(), [1, 0, 0], 1).R();
                M.S().move(.1, .35, .02).scale(.08,.02,.02).draw(Cube(), [0, 0, 1], 1).R();
            }

            M.R();
        }

    }
}

class Clock {
    constructor(){
        this.platform = back_wall;
        this.unit_length_forward = 2; // forward and backward
        this.unit_length_right = 2; // left and right
        this.pos_forward = 0;
        this.pos_right = 0;
        this.can_rotate = true;
        this.visible = true;
        this.is_small_thing = false;
        this.is_placed_on_table = false;
        this.is_table = false;
        this.is_under_editing = true;
        this.red_face = {
            forward: true,
            backward: false,
            left: false,
            right: false,
        }
        this.item_on_table = [];
    }

    moveRed(){
        console.log(this.pos_forward, this.pos_right);
        if (this.red_face.forward){
            if (this.pos_forward + this.unit_length_forward - 1 < 6){
                for (let instance of this.item_on_table){
                    instance.pos_forward += 1;
                }
                this.pos_forward += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                for (let instance of this.item_on_table){
                    instance.pos_forward -= 1;
                }
                this.pos_forward -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_right + this.unit_length_right -1 < 6){
                for (let instance of this.item_on_table){
                    instance.pos_right += 1;
                }
                this.pos_right += 1;
            }
        } else if (this.red_face.left){
            if (this.pos_right - this.unit_length_right + 1> 0){
                for (let instance of this.item_on_table){
                    instance.pos_right -= 1;
                }  
                this.pos_right -= 1;
            }
        }
    }

    moveBlue(){
        console.log(this.pos_forward, this.pos_right);
        if (this.red_face.forward){
            if (this.pos_right + this.unit_length_right -1 < 6){
                for (let instance of this.item_on_table){
                    instance.pos_right += 1;
                }
                this.pos_right += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_right - this.unit_length_right + 1 > 0){
                for (let instance of this.item_on_table){
                    instance.pos_right -= 1;
                }
                this.pos_right -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                for (let instance of this.item_on_table){
                    instance.pos_forward -= 1;
                }
                this.pos_forward -= 1;
            }
        } else if (this.red_face.left){
            if (this.pos_forward + this.unit_length_forward - 1 < 6){
                for (let instance of this.item_on_table){
                    instance.pos_forward += 1;
                }
                this.pos_forward += 1;
            }
        }
    }


    rotateBlue(){
        if (
            this.unit_length_forward != this.unit_length_right && (
            this.pos_forward - this.unit_length_right + 1 < 0 ||
            // this.pos_right - this.unit_length_forward + 1 < 0 ||
            // this.pos_forward + this.unit_length_right - 1 > 7 ||
            this.pos_right+ this.unit_length_forward - 1 > 7
            )
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            this.pos_right 
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.forward = true;
            }
        }
    }

    rotateRed(){
        if (
            this.unit_length_forward != this.unit_length_right && (
            // this.pos_forward - this.unit_length_right + 1 < 0 ||
            this.pos_right - this.unit_length_forward + 1 < 0 ||
            this.pos_forward + this.unit_length_right - 1 > 7
            // this.pos_right+ this.unit_length_forward - 1 > 7
            )
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.forward = true;
            }
        }
    }

    draw(){
        // console.log(this.pos_forward, this.pos_right);
        // console.log(this.unit_length_forward, this.unit_length_right);

        if (this.visible)
        {   
            // let seat = {
            //     size: { x: .3, y: .1, z: .55 },
            //     position:{ x: 0, y: -.15, z: 0 },
            // }
            // let leg = {
            //     size: { x: .06, y: .06, z: .1 },
            //     position:{ x: 0, y: 0, z: .25 },
            // }

            M.S();

            //change to specific position
            M.move(this.platform.position.x + ((this.pos_right - 3)*2-1) * this.platform.size.x / 8,
                this.platform.position.y + ((this.pos_forward - 3)*2-1) * this.platform.size.y / 8,
                -.68);
            M.move(.11, .075, this.platform.size.z / 8);
            

            if (this.platform == right_wall){
                M.turnZ(Math.PI/2);
            } else if (this.platform == left_wall){
                M.turnZ(-Math.PI/2);
            }
            M.scale(.14);
            M.turnX(Math.PI/2);
            

            //rotate base on red face
            if (this.red_face.forward){
                M.turnY(0);
            } else if (this.red_face.right){
                M.turnY(Math.PI / 2);
            } else if (this.red_face.backward){
                M.turnY(Math.PI);
            } else if (this.red_face.left){
                M.turnY(-Math.PI / 2);
            }

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
            if (this.is_under_editing){
                selectPlatform(this.platform);
                M.S().move(0, .35, -.08).scale(.02,.02,.08).draw(Cube(), [1, 0, 0], 1).R();
                M.S().move(.1, .35, .02).scale(.08,.02,.02).draw(Cube(), [0, 0, 1], 1).R();
            }

            M.R();
        }

    }
}

class Sofa {
    constructor(){
        this.platform = floor;
        this.unit_length_forward = 1; // forward and backward
        this.unit_length_right = 1; // left and right
        this.pos_forward = 6;
        this.pos_right = 3;
        this.can_rotate = true;
        this.visible = true;
        this.is_small_thing = false;
        this.is_placed_on_table = false;
        this.is_table = false;
        this.is_under_editing = true;
        this.red_face = {
            forward: false,
            backward: false,
            left: false,
            right: true,
        }
    }

    moveRed(){
        if (this.red_face.forward){
            if (this.pos_forward + this.unit_length_forward - 1 < 7){
                this.pos_forward += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                this.pos_forward -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_right + this.unit_length_right -1 < 7){
                this.pos_right += 1;
            }
        } else if (this.red_face.left){
            if (this.pos_right - this.unit_length_right + 1> 0){
                this.pos_right -= 1;
            }
        }
    }

    moveBlue(){
        if (this.red_face.forward){
            if (this.pos_right + this.unit_length_right -1 < 7){
                this.pos_right += 1;
            }
        } else if (this.red_face.backward){
            if (this.pos_right - this.unit_length_right + 1 > 0){
                this.pos_right -= 1;
            }
        } else if (this.red_face.right){
            if (this.pos_forward - this.unit_length_forward + 1> 0){
                this.pos_forward -= 1;
            }
        } else if (this.red_face.left){
            if (this.pos_forward + this.unit_length_forward - 1 < 7){
                this.pos_forward += 1;
            }
        }
    }


    rotateBlue(){
        if (
            this.pos_forward - this.unit_length_right + 1 < 0 ||
            // this.pos_right - this.unit_length_forward + 1 < 0 ||
            // this.pos_forward + this.unit_length_right - 1 > 7 ||
            this.pos_right+ this.unit_length_forward - 1 > 7
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.forward = true;
            }
        }
    }

    rotateRed(){
        if (
            // this.pos_forward - this.unit_length_right + 1 < 0 ||
            this.pos_right - this.unit_length_forward + 1 < 0 ||
            this.pos_forward + this.unit_length_right - 1 > 7
            // this.pos_right+ this.unit_length_forward - 1 > 7
        ){
            return;
        } else {
            let temp = this.unit_length_forward;
            this.unit_length_forward = this.unit_length_right;
            this.unit_length_right = temp;
            if (this.red_face.forward){
                this.red_face.forward = false;
                this.red_face.left = true;
            } else if (this.red_face.left){
                this.red_face.left = false;
                this.red_face.backward = true;
            } else if (this.red_face.backward){
                this.red_face.backward = false;
                this.red_face.right = true;
            } else if (this.red_face.right){
                this.red_face.right = false;
                this.red_face.forward = true;
            }
        }
    }

    draw(){
        if (this.visible)
        {   
            let seat = {
                size: { x: .3, y: .25, z: .3 },
                position:{ x: 0, y: -.2, z: 0 },
            }
            let back = {
                size: { x: .04, y: .36, z: .3 },
                position:{ x: .35, y: .4, z: 0 },
            }

            M.S();

            //change to specific position
            M.move(floor.position.x + ((this.pos_right - 3)*2-1) * floor.size.x / 8,
                 -.43 ,
                 floor.position.z + ((this.pos_forward - 3)*2-1) * floor.size.z / 8);
            M.scale(.14);

            //rotate base on red face
            if (this.red_face.forward){
                M.turnY(0);
            } else if (this.red_face.right){
                M.turnY(Math.PI / 2);
            } else if (this.red_face.backward){
                M.turnY(Math.PI);
            } else if (this.red_face.left){
                M.turnY(-Math.PI / 2);
            }

            M.S().move(seat.position.x, seat.position.y, seat.position.z);
                M.S();
                    M.scale(seat.size.x, seat.size.y, seat.size.z)
                    .turnX(Math.PI / 2)
                    .draw(Cylinder(20), [1, 1, 1], 1, 10, -1);
                M.R();
            M.R();
            if (this.is_under_editing){
                selectPlatform(this.platform);
                M.S().move(0, .35, .08).scale(.02,.02,.08).draw(Cube(), [1, 0, 0], 1).R();
                M.S().move(.1, .35, .02).scale(.08,.02,.02).draw(Cube(), [0, 0, 1], 1).R();
            }

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
            M.R();

        }

    }
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
        instance.draw();
    }
}

function addItem(item){
    if(selectedInstance != null){
        //stop editing the previous one
        can_be_added = stopChangeItem();
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
