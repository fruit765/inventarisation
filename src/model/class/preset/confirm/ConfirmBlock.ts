// import BlockGroup from "./blockGroup"

// export default class ConfirmBlock {
//     private block: any
//     private blockRaw: any
//     private blockGroup: BlockGroup

//     constructor(confirmBlock: any) {
//         this.blockRaw = confirmBlock
//         this.blockGroup = new BlockGroup(confirmBlock.group)
//         this.blockValue = 
//         this.initBlock()
//     }

//     initBlock() {
//         this.block = this.blockRaw
//         this.block.group = this.blockGroup.get()
//     }

//     /**Это поле отклонено?*/
//     isReject(confirm: any) {
//         return confirm.action === "reject"
//     }

//     /**это поле подтверждено? */
//     private isConfirm(confirm: any) {
//         const isNoReject = confirm.action !== "reject"
//         const isNoUndef = confirm.id != undefined
//         const incVal = this.block.value.includes(confirm.id)
//         if (isNoReject && isNoUndef && incVal) {
//             return true
//         }
//         return false
//     }

//     /**Если подтверждение требуется возвратит блок подтверждения */
//     getNeedConfirm(confirm: any) {
//         if (this.isConfirm(confirm) || this.isReject(confirm)) {
//             return undefined
//         } else {
//             return this.block
//         }
//     }
// }