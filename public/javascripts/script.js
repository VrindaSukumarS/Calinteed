function cart(proId){
    $.ajax({
      url : `/cart/${proId}`,
      method :'get',
      success : (response)=>{
        console.log(response);
        if(response.status){
            let count=$('#cartCount').html()
            count=parseInt(count)+1
            $("#cartCount").html(count)
        }
        alert(response)
      }
    })
}