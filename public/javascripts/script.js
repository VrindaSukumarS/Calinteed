// const { log } = require("console");

function cart(proId) {
  $.ajax({
    url: `/cart/${proId}`,
    method: 'get',
    success: (response) => {
      if (response.status) {

        let count = $('#cartCount').html()
        count = parseInt(count) + 1
        $("#cartCount").html(count)
        Toastify({
          text: "Product added to Cart",
          className: "info",
          gravity: "top", // `top` or `bottom`
          position: "center", // `left`, `center` or `right`
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          }
        }).showToast();

      }
      else{
        Toastify({
          text: "Out of Stock",
          className: "info",
          gravity: "top", // `top` or `bottom`
          position: "center", // `left`, `center` or `right`
          style: {
            background: "linear-gradient(to right, red,red)",
          }
        }).showToast();

      }
    }
  })
}



function wishlist(proId) {
  $.ajax({
    url: `/addToWishlist/${proId}`,
    method: 'get',
    success: (response) => {
      if (response.addProduct) {
        console.log('uuuuuuuuuuuuuuuuuuuuuuu',response.addProduct);
        Toastify({
          text: "Product added to Wishlist",
          className: "wishlist",
          gravity: "top", // `top` or `bottom`
          position: "center", // `left`, `center` or `right`
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          }
        }).showToast();

      }
      else{
        Toastify({
          text: "Product removed from Wishlist",
          className: "info",
          gravity: "top", // `top` or `bottom`
          position: "center", // `left`, `center` or `right`
          style: {
            background: "linear-gradient(to right, red,red)",
          }
        }).showToast();

      }
    }
  })
}