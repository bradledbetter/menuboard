Server
======

Models
------
- attribute
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
    - url: string

- menu
    - menuitem[]
    - title: string
    - description: string
    - id: string
    - isActive: boolean

- menu-item
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
