import { provideHttpClient } from '@angular/common/http';
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
import { ProveedoresComponent } from './pages/proveedores/proveedores.component';
import { PlataformasComponent } from './pages/plataformas/plataformas.component';
import { TiposContenidoComponent } from './pages/tipos-contenido/tipos-contenido.component';
import { TiposPagoComponent } from './pages/tipos-pago/tipos-pago.component';

import { RutValidatorDirective } from './validators/rut.validator';
import { TelefonoValidatorDirective } from './validators/telefono.validator';
import { CorreoValidatorDirective } from './validators/correo.validator';
import { NombreValidatorDirective } from './validators/nombre.validator';
import { ContrasenaValidatorDirective } from './validators/contrasena.validator';
import { FechaPipe } from './pipes/fecha.pipe';
import { PesosPipe } from './pipes/pesos.pipe';
import { RutPipe } from './pipes/rut.pipe';
import { TelefonoPipe } from './pipes/telefono.pipe';
import { InicialesPipe } from './pipes/iniciales.pipe';
import { NombrePropioPipe } from './pipes/nombre-propio.pipe';

registerLocaleData(localeEsCl);

@NgModule({
  declarations: [
    RutValidatorDirective,
    TelefonoValidatorDirective,
    CorreoValidatorDirective,
    NombreValidatorDirective,
    ContrasenaValidatorDirective,
    FechaPipe,
    PesosPipe,
    RutPipe,
    TelefonoPipe,
    InicialesPipe,
    NombrePropioPipe,
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
    ProveedoresComponent,
    PlataformasComponent,
    TiposContenidoComponent,
    TiposPagoComponent,
  ],
  imports: [BrowserModule, FormsModule, AppRoutingModule],
  providers: [
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'es-CL' },
  ],
  bootstrap: [App],
})
export class AppModule {}
