import { NgModule, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsCl from '@angular/common/locales/es-CL';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LayoutComponent } from './components/layout/layout.component';
import { TablaContenidoComponent } from './components/tabla-contenido/tabla-contenido.component';
import { BotonesAccionesComponent } from './components/botones-acciones/botones-acciones.component';
import { TarjetaResumenComponent } from './components/tarjeta-resumen/tarjeta-resumen.component';
import { TablaProductosComponent } from './components/tabla-productos/tabla-productos.component';

import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdministrarCuentasComponent } from './pages/administrar-cuentas/administrar-cuentas.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { NuevaVentaComponent } from './pages/nueva-venta/nueva-venta.component';
import { ComprasComponent } from './pages/compras/compras.component';
import { NuevaCompraComponent } from './pages/nueva-compra/nueva-compra.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { CategoriasProductoComponent } from './pages/categorias-producto/categorias-producto.component';

registerLocaleData(localeEsCl);

@NgModule({
  declarations: [
    App,
    SidebarComponent,
    LayoutComponent,
    TablaContenidoComponent,
    BotonesAccionesComponent,
    TarjetaResumenComponent,
    TablaProductosComponent,
    LoginComponent,
    DashboardComponent,
    AdministrarCuentasComponent,
    VentasComponent,
    NuevaVentaComponent,
    ComprasComponent,
    NuevaCompraComponent,
    InventarioComponent,
    ProductosComponent,
    CategoriasProductoComponent,
  ],
  imports: [BrowserModule, FormsModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners(), { provide: LOCALE_ID, useValue: 'es-CL' }],
  bootstrap: [App],
})
export class AppModule {}
