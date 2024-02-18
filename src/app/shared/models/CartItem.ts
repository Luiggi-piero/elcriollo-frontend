import { Food } from "./Food";

export class CartItem {

    constructor(public food: Food){}
    
    price: number = this.food.price;
    quantity: number = 1;
}