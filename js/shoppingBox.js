class Shop {

    shoppingBag = [];

    createProductNoCarrousel(st) {
        const { alt, description, precio, buttonLabel, srcs } = st;
        const current = document.createElement('div');
        current.className = 'card width-18';
        current.innerHTML = `<img src="${srcs[0]}" class="card-img-top" alt="${alt}">
        <div class="card-body productProperties">
            <h5 class="card-title">${description}</h5>
            <p class="card-text">$${precio}</p>
            <button class="btn btn-primary addToBox">${buttonLabel}</button>
        </div>`;
        return current;
    }

    createProductWithCarrousel(st) {
        const { id, alt, description, precio, buttonLabel, srcs } = st;
        const current = document.createElement('div');
        current.className = 'card width-18';

        let imgCarrouselHTML = ''
        srcs.forEach((im, index) => {
            imgCarrouselHTML += `<div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${im}" class="d-block w-100" alt="${alt}">
        </div>`
        });

        current.innerHTML = `
        <div id="${id}" class="carousel slide" data-ride="carousel">
            <div class="carousel-inner">
               ${imgCarrouselHTML}
            </div>
            <button class="carousel-control-prev" type="button" data-target="#${id}"
                data-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="sr-only">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-target="#${id}"
                data-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="sr-only">Next</span>
            </button>
        </div>
        <div class="card-body productProperties">
            <h5 class="card-title">${description}</h5>
            <p class="card-text">$${precio}</p>
            <button class="btn btn-primary addToBox">${buttonLabel}</button>
        </div>`
    return current;
}

    addToSHoppingBag(item) {
        this.shoppingBag.push(item);
        this.saveStorage();
    }

    removeToShoppingBag(id) {
        this.shoppingBag = this.shoppingBag.filter(s => s.rowNumber.toString() !== id);
        this.saveStorage();
    }

    saveStorage() {
        localStorage.setItem('shoppingBag', JSON.stringify(this.shoppingBag));
    }

    getStorage() {
        return localStorage.getItem('shoppingBag');
    }

}

$(document).ready(function () {

    const xhttp = new XMLHttpRequest();

    xhttp.open('GET', '../stock/stock.json', true);

    xhttp.send();

    xhttp.onreadystatechange = function () {

        if (this.readyState == 4 && this.status == 200) {

            let datos = JSON.parse(this.responseText);

            const stock = datos.stock;

            const shop = new Shop();

            const productsContainer = document.querySelector('.cards__Productos');

            stock.forEach((s) => {
                if (s.srcs.length === 1) {
                    const toAdd = shop.createProductNoCarrousel(s);
                    productsContainer.append(toAdd);
                } else {
                    const toAdd = shop.createProductWithCarrousel(s);
                    productsContainer.append(toAdd);
                }
            });

            let addToShoppingBoxButtons = document.querySelectorAll('.addToBox');

            addToShoppingBoxButtons.forEach((addToBoxButton) => {

                addToBoxButton.addEventListener('click', addToBoxClicked);
            });


            const comprarButton = document.querySelector('.comprarButton');
            comprarButton.addEventListener('click', comprarButtonClicked);

            const tableBodyContainer = document.querySelector('#table-body');

            function addToBoxClicked(event) {
                const button = event.target;
                const productProperties = button.closest('.productProperties');

                const productName = productProperties.querySelector('.card-title').textContent;
                const productPrice = productProperties.querySelector('.card-text').textContent;

                addProductToShoppingBox(productName, productPrice);

                toastr.success('Producto agregado al carrito', 'Agregado');
                $('.toast').css("background-color", "green",);

            }

            function addProductToShoppingBox(productName, productPrice, value = 1, id) {
                const elementsTitle = tableBodyContainer.querySelectorAll('.shoppingBoxProductName');
                for (let i = 0; i < elementsTitle.length; i++) {
                    if (elementsTitle[i].innerText === productName) {
                        let elementQuantity = (elementsTitle[i].parentElement.querySelector('.shoppingBoxProductQuantity'));
                        elementQuantity.value++;
                        displayShoppingBoxTotal();
                        displayShoppingBoxSubtotal();
                        return;
                    }

                };

                const rowNumber = $('.shoppingBoxProduct').length + 1;
                const shoppingBoxRow = document.createElement('tr');
                $(shoppingBoxRow).addClass('shoppingBoxProduct');

                const shoppingBoxContent = `
                    <td scope="row">${rowNumber}</td>
                    <td class="shoppingBoxProductName">${productName}</td>
                    <td class="shoppingBoxProductPrice">${productPrice}</td>
                    <td><input data-rowNumber="${rowNumber}" class="shoppingBoxProductQuantity" type="number" value="${value}"></td>
                    <td class="shoppingBoxSubtotal"></td>
                    <td class="botonRojo"><button data-rowNumber="${rowNumber}" class="btn btn-danger buttonDelete" type="button">X</button></td>`;

                shoppingBoxRow.innerHTML = shoppingBoxContent;

                shoppingBoxRow.querySelector('.buttonDelete').addEventListener('click', removeShoppingBoxProduct);
                shoppingBoxRow.querySelector('.shoppingBoxProductQuantity').addEventListener('change', quantityChanged);
                tableBodyContainer.append(shoppingBoxRow);

                shop.addToSHoppingBag({ productName, productPrice, value, rowNumber });
                displayShoppingBoxTotal();
            }

            function displayShoppingBoxTotal() {
                let total = 0;
                let subTotal = 0;

                const shoppingBoxTotal = document.querySelector('.shoppingBoxTotal');
                const shoppingBoxProducts = document.querySelectorAll('.shoppingBoxProduct');

                shoppingBoxProducts.forEach(shoppingBoxProduct => {
                    const shoppingBoxSubtotal = shoppingBoxProduct.querySelector('.shoppingBoxSubtotal');
                    const shoppingBoxProductPriceElement = shoppingBoxProduct.querySelector('.shoppingBoxProductPrice');
                    const shoppingBoxProductPrice = Number(shoppingBoxProductPriceElement.textContent.replace('$', ''));
                    const shoppingBoxProductQuantityElement = shoppingBoxProduct.querySelector('.shoppingBoxProductQuantity');
                    const shoppingBoxProductQuantity = Number(shoppingBoxProductQuantityElement.value);
                    subTotal = shoppingBoxProductPrice * shoppingBoxProductQuantity;
                    total = total + shoppingBoxProductPrice * shoppingBoxProductQuantity;
                    shoppingBoxSubtotal.innerHTML = `$${subTotal}`;
                });
                shoppingBoxTotal.innerHTML = `$${total}`;
            }

            function removeShoppingBoxProduct(event) {
                const buttonClicked = event.target;
                buttonClicked.closest('.shoppingBoxProduct').remove();
                shop.removeToShoppingBag(event.target.dataset.rownumber);
                displayShoppingBoxTotal();
            }

            function quantityChanged(event) {

                const input = event.target;

                if (input.value <= 0) {
                    input.value = 1;
                }

                let shoppingBagItems = shop.getStorage();
                if (shoppingBagItems) {
                    shop.shoppingBag = JSON.parse(shoppingBagItems);
                    let toUpdateQuantity = shop.shoppingBag.find(s => s.rowNumber.toString() === event.target.dataset.rownumber);
                    toUpdateQuantity.value = input.value;
                    shop.saveStorage();
                }
                displayShoppingBoxTotal();
            }

            const shoppingBagItems = shop.getStorage();
            if (shoppingBagItems != null) {
                JSON.parse(shoppingBagItems).forEach(x => {
                    addProductToShoppingBox(x.productName, x.productPrice, x.value);
                })
            }

            function comprarButtonClicked() {
                $('#table-body').html('')
                displayShoppingBoxTotal();
                localStorage.clear();
            }
        }
    }

});
