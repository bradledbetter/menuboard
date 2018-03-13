Server
======

- Controller is glue between routes and models. Makes Model (db) calls, formats data, handles validation, and passes results up the promise chain to the router. Errors should be thrown to be caught by the router in most cases.
- Router is the glue between incoming requests and controller and (usually) handles any errors thrown in the process of CRUD operations.
- Uploads are handled by passing signed, credentialed S3 URLS back to the client.

Models
------
- attribute X
    - id: string
    - name: string
    - value: string

- event
    - image url: string
    - title: string
    - long descr: string
    - start time
    - end time
    - id: string
    - isActive: boolean

- image
    - id: string
    - label: string
    - url: string

- menu
    - menuitem[]
    - title: string
    - description: string
    - id: string
    - isActive: boolean

- menu-item X
    - label: string
    - description: string
    - id: string
    - prices: [{label: string, price: float}]
    - attributes[]
    - isActive: boolean

- slide
    - id: string
    - slidetype Objectref
    - data: Objectref to underlying data
    - templateUrl: string
    - isActive: boolean

- slide-type
    - id: string
    - name (unique): string
        - E.g. event feed, image feed, menu (internal data), image (s3 stored?)
    - isActive: boolean

- slideshow
    - id: string
    - descr: string
    - slide[]
    - isActive: boolean
    - isPrimary: boolean

- user
    - id: string
    - username: string
    - password hash: string
    - isActive: boolean

Routes
------
- POST login
- POST logout
- GET, POST, PUT, DELETE slideshow/(:id)
- GET, POST, PUT, DELETE slide/(:id)
- GET, POST, PUT, DELETE image/(:id)
- GET, POST, PUT, DELETE menu/(:id)
- GET, POST, PUT, DELETE event/(:id)
- GET, POST, PUT, DELETE settings/(:id)
- GET, POST, PUT, DELETE slidetype/(:id)
- GET, POST, PUT, DELETE user/(:id)

Client
======

Routes/Pages
------------
- / -> primary slideshow
- /:id -> slideshow by id
- /admin/login -> login to admin panel
- /admin/<model> -> manage given model
- /admin/logout -> logout
