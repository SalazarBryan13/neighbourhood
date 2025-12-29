
router = APIRouter(prefix="/tiendas", tags=["tiendas"])

def get_db() -> Client:
    return get_supabase()

DbDependency = Annotated[Client, Depends(get_db)]

#obtener todas las tiendas
@router.get("/",response_model=List[TiendasResponse])
def get_tiendas(db: DbDependency, id_user: str = Depends(get_current_user_id)):
    tiendas = db.table("tienda").select("*").eq("id_propietario", id_user).execute()
    return tiendas.data
    


#crear tiendas
@router.post("/",response_model=TiendasResponse ,status_code=201)
def crear_tienda(tienda:TiendaCreate,db:DbDependency):
    nueva_tienda= db.table("tienda").insert(tienda.model_dump()).execute()
    if not nueva_tienda.data:
        raise HTTPException(status_code=400,detail="Error al crear la tienda")
    return nueva_tienda.data[0]


#actualizar tiendas

@router.put("/{id_tienda}",response_model=TiendasResponse,status_code=200)
def actualizar_tienda(id_tienda:int,tienda_update:TiendaUpdate,db:DbDependency,user_id:str=Depends(get_current_user_id)):
    dato = tienda_update.model_dump(exclude_unset=True)
    tienda_actualizada = db.table("tienda").update(dato).eq("id_tienda",id_tienda).eq("id_propietario",user_id).execute()
    if not tienda_actualizada.data:
        raise HTTPException(status_code=400,detail="Error al actualizar la tienda")
    return tienda_actualizada.data[0]


#eliminar tienda
@router.delete("/{id_tienda}",status_code=204)
def eliminar_tienda(id_tienda:int,db:DbDependency,user_id:str=Depends(get_current_user_id)):
    response = db.table("tienda").delete().eq("id_tienda",id_tienda).eq("id_propietario",user_id).execute()
    if not response.data:
        raise HTTPException(status_code=400,detail="Error al eliminar la tienda")
    return None






router = APIRouter(prefix="/productos", tags=["productos"])


def get_db() -> Client:
    return get_supabase()


DbDependency = Annotated[Client, Depends(get_db)]


#obtener producto por
@router.get("/", response_model=List[ProductoResponse])
def get_productos(db: DbDependency):
    productos = db.table("producto").select("*").execute()
    return productos.data




#crear producto
@router.post("/", response_model=ProductoResponse, status_code=201)
def crear_producto(db: DbDependency, producto: ProductoCreate):
    datos = producto.model_dump()
    datos["precio"] = float(datos["precio"])  # Convertir Decimal a float para JSON
    nuevo_producto = db.table("producto").insert(datos).execute()
    if not nuevo_producto.data:
        raise HTTPException(status_code=400, detail="Error al crear el producto")
    return nuevo_producto.data[0]


#actualizar producto
@router.put("/{id_producto}", response_model=ProductoResponse, status_code=200)
def actualizar_producto(db: DbDependency, id_producto: int, producto_update: ProductoUpdate):
    datos = producto_update.model_dump(exclude_unset=True)
    if "precio" in datos and datos["precio"] is not None:
        datos["precio"] = float(datos["precio"])  # Convertir Decimal a float para JSON
    producto_actualizado = db.table("producto").update(datos).eq("id_producto", id_producto).execute()
    if not producto_actualizado.data:
        raise HTTPException(status_code=400, detail="Error al actualizar el producto")
    return producto_actualizado.data[0]


#eliminar producto
@router.delete("/{id_producto}", status_code=204)
def eliminar_producto(db: DbDependency, id_producto: int):
    response = db.table("producto").delete().eq("id_producto", id_producto).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Error al eliminar el producto")
    return None


router = APIRouter(prefix="/inventarios", tags=["inventarios"])

def get_db() -> Client:
    return get_supabase()
DbDependency = Annotated[Client, Depends(get_db)]

#obtener todos los inventarios
@router.get("/",response_model=List[InventarioResponse])
def get_inventarios(db: DbDependency, id_tienda: int = Depends(get_current_tienda_id)):
    inventarios = db.table("inventario").select("*").eq("id_tienda", id_tienda).execute()
    return inventarios.data


@router.put("/{id_inventario}",response_model= InventarioResponse,status_code=200)
def actualizar_inventario(db:DbDependency,id_inventario:int,tienda_update:InventarioUpdate):
    datos=tienda_update.model_dump(exclude_unset=True)
    inventario_actualizado=db.table("inventario").update(datos).eq("id_inventario",id_inventario).execute()
    if not inventario_actualizado.data:
        raise HTTPException(status_code=400,detail="Error al actualizar el inventario")
    return inventario_actualizado.data[0]

@router.post("/",response_model=InventarioResponse,status_code=201)
def crear_inventario(db:DbDependency,inventario:InventarioCreate):
    nuevo_inventario=db.table("inventario").insert(inventario.model_dump()).execute()
    if not nuevo_inventario.data:
        raise HTTPException(status_code=400,detail="Error al crear el inventario")
    return nuevo_inventario.data[0]

@router.delete("/{id_inventario}",status_code=204)
def eliminar_inventario(db:DbDependency,id_inventario:int):
    response=db.table("inventario").delete().eq("id_inventario",id_inventario).execute()
    if not response.data:
        raise HTTPException(status_code=400,detail="Error al eliminar el inventario")
    return None

    
router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_db() -> Client:
    return get_supabase()


DbDependency = Annotated[Client, Depends(get_db)]


#obtener todas las categorias por tienda
@router.get("/", response_model=List[CategoriaResponse])
def get_categorias(db: DbDependency):
    categorias = db.table("categoria").select("*").execute()
    return categorias.data




#crear categoria
@router.post("/", response_model=CategoriaResponse, status_code=201)
def crear_categoria(db: DbDependency, categoria: CategoriaCreate):
    nueva_categoria = db.table("categoria").insert(categoria.model_dump()).execute()
    if not nueva_categoria.data:
        raise HTTPException(status_code=400, detail="Error al crear la categoria")
    return nueva_categoria.data[0]


#actualizar categoria
@router.put("/{id_categoria}", response_model=CategoriaResponse, status_code=200)
def actualizar_categoria(db: DbDependency, id_categoria: int, categoria_update: CategoriaUpdate):
    datos = categoria_update.model_dump(exclude_unset=True)
    categoria_actualizada = db.table("categoria").update(datos).eq("id_categoria", id_categoria).execute()
    if not categoria_actualizada.data:
        raise HTTPException(status_code=400, detail="Error al actualizar la categoria")
    return categoria_actualizada.data[0]


#eliminar categoria
@router.delete("/{id_categoria}", status_code=204)
def eliminar_categoria(db: DbDependency, id_categoria: int):
    response = db.table("categoria").delete().eq("id_categoria", id_categoria).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Error al eliminar la categoria")
    return None

