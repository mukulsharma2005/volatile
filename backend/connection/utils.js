import userModel from "../models/user.model.js";

export async function getUserFromSocket(socket) {
    const user = await userModel.findById(socket.userId)
    if (!user) {
        socket.emit("client-error", {
            code: 400,
            message: "User does not have a connection."
        });
        return new Error();
    }
    return user;
}
export function haveSameElements(arr1, arr2) {
    console.log(arr1,arr2)
    if (arr1.length != arr2.length) {
        return false;
    }

    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    console.log(sortedArr1,sortedArr2)
    return sortedArr1.every((element, index) => element == sortedArr2[index]);
}