const { CategoriaProducto, Producto, Proveedor, Plataforma } = require('../models');
const catalogos = require('../controllers/catalogos');
const { crearRegistro, ejecutar } = require('./helpers');

describe('controlador generico de catalogos', () => {
  test('lista con id y los campos del catalogo', async () => {
    jest
      .spyOn(CategoriaProducto, 'findAll')
      .mockResolvedValue([{ idCategoria: 4, nombre: 'Poleras', fechaCreacion: new Date() }]);

    const res = await ejecutar(catalogos.categorias.listar);

    expect(res.json).toHaveBeenCalledWith([{ id: 4, nombre: 'Poleras' }]);
  });

  test('crear ignora campos que no son del catalogo', async () => {
    const crear = jest
      .spyOn(CategoriaProducto, 'create')
      .mockResolvedValue(crearRegistro({ idCategoria: 1, nombre: 'Gorros' }));

    const res = await ejecutar(catalogos.categorias.crear, {
      body: { nombre: 'Gorros', idCategoria: 50 },
    });

    expect(crear).toHaveBeenCalledWith({ nombre: 'Gorros' });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('crear sin nombre es 400', async () => {
    await expect(ejecutar(catalogos.tiposPago.crear, { body: {} })).rejects.toMatchObject({
      status: 400,
    });
  });

  test('actualizar cambia el registro y lo devuelve', async () => {
    const registro = crearRegistro({
      idProducto: 3,
      nombre: 'Mate',
      idCategoria: 1,
      categoria: { nombre: 'Accesorios' },
    });

    jest.spyOn(Producto, 'findByPk').mockResolvedValue(registro);

    const res = await ejecutar(catalogos.productos.actualizar, {
      params: { id: '3' },
      body: { nombre: 'Mate de calabaza' },
    });

    expect(res.json.mock.calls[0][0]).toMatchObject({
      id: 3,
      nombre: 'Mate de calabaza',
      categoria: 'Accesorios',
    });
  });

  test('eliminar borra y responde 204', async () => {
    const registro = crearRegistro({ idCategoria: 1 });

    jest.spyOn(CategoriaProducto, 'findByPk').mockResolvedValue(registro);

    const res = await ejecutar(catalogos.categorias.eliminar, { params: { id: '1' } });

    expect(registro.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
  });
});

describe('catalogos con reglas propias', () => {
  test('proveedor con rut invalido es 400', async () => {
    await expect(
      ejecutar(catalogos.proveedores.crear, {
        body: { razonSocial: 'Textil SpA', rut: '12345678-0' },
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  test('el rut se guarda normalizado aunque venga sin digito verificador', async () => {
    const crear = jest
      .spyOn(Proveedor, 'create')
      .mockResolvedValue(crearRegistro({ idProveedor: 1 }));

    await ejecutar(catalogos.proveedores.crear, {
      body: { razonSocial: 'Textil SpA', rut: '12.345.678' },
    });

    expect(crear.mock.calls[0][0].rut).toBe('12345678-5');
  });

  test('editar un proveedor sin mandar rut no lo valida', async () => {
    const registro = crearRegistro({ idProveedor: 1, rut: '12345678-5' });

    jest.spyOn(Proveedor, 'findByPk').mockResolvedValue(registro);

    await ejecutar(catalogos.proveedores.actualizar, {
      params: { id: '1' },
      body: { telefono: '+56911112222' },
    });

    expect(registro.update).toHaveBeenCalledWith({ telefono: '+56911112222' });
  });

  test('la plataforma guarda sus tipos de pago y los devuelve por nombre', async () => {
    const registro = crearRegistro({
      idPlataforma: 2,
      nombre: 'Shopify',
      tiposPago: [{ nombre: 'Transferencia' }],
    });

    registro.setTiposPago = jest.fn();
    jest.spyOn(Plataforma, 'create').mockResolvedValue(registro);

    const res = await ejecutar(catalogos.plataformas.crear, {
      body: { nombre: 'Shopify', idsTiposPago: [1] },
    });

    expect(registro.setTiposPago).toHaveBeenCalledWith([1]);
    expect(res.json.mock.calls[0][0].tiposPago).toEqual(['Transferencia']);
  });

  test('el precio de venta del producto se guarda como numero', async () => {
    const crear = jest
      .spyOn(Producto, 'create')
      .mockResolvedValue(crearRegistro({ idProducto: 2, nombre: 'Boina' }));

    jest.spyOn(Producto, 'findByPk').mockResolvedValue(crearRegistro({ idProducto: 2 }));

    await ejecutar(catalogos.productos.crear, {
      body: { nombre: 'Boina', idCategoria: 1, precioVenta: '1500.5' },
    });

    expect(crear.mock.calls[0][0].precioVenta).toBe(1500.5);
  });

});
