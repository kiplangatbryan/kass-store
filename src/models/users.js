const mongoose = require("mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema(
   {
      title: {
         required: true,
         type: String,
      },
      email: {
         required: true,
         type: String,
      },
      pascode: {
         required: true,
         type: String,
      },
      admin: {
         required: true,
         type: Boolean,
      },
      cart: {
         Items: [
            {
               product: {
                  type: Schema.Types.ObjectId,
                  ref: "Product",
                  required: true,
               },
               quantity: { type: Number, required: true },
            },
         ],
      },
      resetToken: "",
      resetTokenExpiration: "",
      address: {},
   },
   { timestamps: true }
)

userSchema.methods.addToCart = function (product) {
   const present = this.cart.Items.findIndex((i) => {
      return i.product.toString() === product._id.toString()
   })
   let newQuantity = 1
   let updateCart = [...this.cart.Items]

   if (present == -1) {
      updateCart.push({
         product: product._id,
         quantity: newQuantity,
      })
   } else {
      newQuantity = this.cart.Items[present].quantity + 1
      updateCart[present].quantity = newQuantity
   }

   this.cart = {
      Items: updateCart,
   }
   return this.save()
}
userSchema.methods.deleteItem = function (product) {
   let tempArray = this.cart.Items
   const found = tempArray.findIndex((id) => {
      return id.product.toString() === product._id.toString()
   })


   tempArray.splice(found, 1)

   this.cart = {
      Items: tempArray,
   }

   return this.save()
}

module.exports = mongoose.model("User", userSchema)
