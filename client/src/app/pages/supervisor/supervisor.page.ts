import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductDTO } from 'src/app/models/productDTO';
import { ProductService } from 'src/app/services/products/product.service';
import { AlertTools } from 'src/app/tools/AlertTools';
import { listOfProducts } from 'src/app/listOfProducts';
import { UserService } from 'src/app/services/users/user.service';

@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.page.html',
  styleUrls: ['./supervisor.page.scss'],
})
export class SupervisorPage {

  constructor(private router: Router, private productsService: ProductService, private tools: AlertTools, private userService: UserService) { }

  data: any[] = []

  product: ProductDTO = new ProductDTO()

  isProductModalOpen: boolean = false

  async ionViewWillEnter() {
    await this.getData()
    await this.listProducts()
  }

  async getData() {
    await this.tools.presentLoading();

    this.userService.getData().subscribe(
      async (res: any) => {
        if (res.statusCode != 200) this.router.navigateByUrl('login')
        else if (res.model.role != 0) this.router.navigateByUrl('home')

        this.tools.dismissLoading()
      },
      async (err) => {
        localStorage.clear()
        this.tools.dismissLoading()
        this.router.navigateByUrl('login')
      }
    )
  }

  createOrderPage() {
    this.router.navigateByUrl('create-order')
  }

  openAddProductModal() {
    this.product = new ProductDTO()
    this.isProductModalOpen = true
  }

  openUpdateProductModal(product: ProductDTO) {
    this.product = product
    this.isProductModalOpen = true
  }

  async deleteproductActionButton(product: ProductDTO) {
    const alertButtons = [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel delete product')
        }
      },
      {
        text: 'Eliminar',
        role: 'confirm',
        handler: () => this.deleteProduct(product)
      },
    ];

    await this.tools.presentAlert(
      'Eliminar producto',
      `El producto ${product.sku} se eliminará de manera permanente.`,
      alertButtons
    )
  }

  async deleteProduct(product: ProductDTO): Promise<void> {
    await this.tools.presentLoading(`Eliminando producto ${product.sku}...`)

    this.productsService.delete(product.id!).subscribe(
      async (res: any) => {
        if (res.statusCode != 200) {
          await this.tools.presentAlert('Etkilla', res.message, ['Aceptar']);
        } else {
          await this.listProducts()
        }
        await this.tools.dismissLoading();
      },
      async (error) => {
        await this.tools.presentToast('¡Error al eliminar producto!', 1500, 'light');
        await this.tools.dismissLoading();
      }
    )
  }

  async listProducts() {

    // Cargar productos desde json local
    this.data = listOfProducts.map(item => ({
      name: item.brand.name,
      products: item.brand.products.map(product => ({
        brand: product.brand,
        description: product.description,
        sku: product.sku,
        imageUrl: product.imageUrl
      }))
    }));

    // Cargar productos desde el servicio
    //     await this.tools.presentLoading('Cargando productos...')
    //     this.productsService.getAllByBrand().subscribe(
    //       async (res: any) => {
    //         if (res.statusCode != 200) {
    //           await this.tools.presentToast('Error al cargar los productos', 2000, 'danger');
    //         } else {
    //           this.data = res.model;
    //         }
    //         await this.tools.dismissLoading();
    //       }, async (error) => {
    //         await this.tools.dismissLoading();
    //         await this.tools.presentToast('Error en el servidor', 2000, 'danger');
    //       }
    //     )
    // }
  }
}
