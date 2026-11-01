const routesWithPrefix = (prefix, routes) => {
    return routes.map(route => {
        route.path = `${prefix}${route.path}`
        return route
    })
}


const routes = [
    {
        path: '/login', name: 'Login', component: () => import('pages/Login.vue'),
        meta: {requireNoAuth: true},
    },
    {path: '/survey/:token', component: () => import('pages/AfterSalesService/Survey.vue')},
    // فرم اولیه‌ای که مشتری از طریق لینک پیامک شده تکمیل می‌کند (بدون ورود)
    {path: '/request/:token', component: () => import('pages/IntakeForm.vue')},
    {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        redirect: 'dashboard',
        meta: {requireAuth: true},
        children: [
            {path: 'dashboard', name: 'Dashboard', component: () => import('pages/Dashboard.vue')},
            {path: 'settings', name: 'Settings', component: () => import('pages/Settings.vue')},
            {path: 'users', name: 'Users', component: () => import('pages/Users.vue')},

            // ...routesWithPrefix('/report', [
            //     ...routesWithPrefix('/daily', [
            //         {
            //             path: '/today',
            //             name: 'DailyReportCreate',
            //             component: () => import('pages/Reports/DailyReport/CreateDailyReport.vue')
            //         },
            //         {
            //             path: '/list',
            //             name: 'DailyReportList',
            //             component: () => import('pages/Reports/DailyReport/List.vue')
            //         },
            //         {
            //             path: '/today-list',
            //             name: 'DailyReportTodayList',
            //             component: () => import('pages/Reports/DailyReport/TodayList.vue')
            //         }
            //     ]),
            // ]),


            ...routesWithPrefix('/targeting', [
                {path: '/create', name: 'TargetingCreate', component: () => import('pages/Targeting/Create.vue')},
                {path: '/edit/:id', name: 'TargetingEdit', component: () => import('pages/Targeting/Edit.vue')},
                {path: '/list', name: 'TargetingList', component: () => import('pages/Targeting/List.vue')},
            ]),

            ...routesWithPrefix('/planning', [
                {path: '/create', name: 'PlanningCreate', component: () => import('pages/Planning/Create.vue')},
                {path: '/edit/:id', name: 'PlanningEdit', component: () => import('pages/Planning/Edit.vue')},
                {path: '/list', name: 'PlanningList', component: () => import('pages/Planning/List.vue')},
            ]),

            ...routesWithPrefix('/charts/', [
                // {path: 'activities/TargetingChart', name: 'TargetingChart', component: () => import('pages/Charts/Activities/Targeting.vue')},
                {
                    path: 'activities/SuccessfulSale',
                    name: 'SuccessfulSale',
                    component: () => import('pages/Charts/Activities/SuccessfulSale.vue')
                },
                {
                    path: 'activities/UserReport',
                    name: 'UserReport',
                    component: () => import('pages/Charts/Activities/UserReport.vue')
                },
                {path: 'activities/Call', name: 'Call', component: () => import('pages/Charts/Activities/Call.vue')},


                {
                    path: 'leads/LeadsMethod',
                    name: 'LeadsMethod',
                    component: () => import('pages/Charts/Leads/LeadsMethod.vue')
                },
                {
                    path: 'leads/LeadsStatus',
                    name: 'LeadsStatus',
                    component: () => import('pages/Charts/Leads/LeadStatus.vue')
                },

                {
                    path: 'sales/ProductChart',
                    name: 'ProductChart',
                    component: () => import('pages/Charts/Sales/Product.vue')
                },
                {
                    path: 'sales/SellerChart',
                    name: 'SellerChart',
                    component: () => import('pages/Charts/Sales/Seller.vue')
                },

            ]),

            ...routesWithPrefix('/leads', [
                {path: '/create', name: 'LeadCreate', component: () => import('pages/Leads/Create.vue')},
                {path: '/edit/:id', name: 'LeadEdit', component: () => import('pages/Leads/Edit.vue')},
                {path: '/list', name: 'LeadsList', component: () => import('pages/Leads/List.vue')}
            ]),

            ...routesWithPrefix('/customers', [
                {path: '/create', name: 'CustomerCreate', component: () => import('pages/Customers/Create.vue')},
                {path: '/edit/:id', name: 'CustomerEdit', component: () => import('pages/Customers/Edit.vue')},
                {path: '/list', name: 'CustomersList', component: () => import('pages/Customers/List.vue')},
                {
                    path: '/opportunities',
                    name: 'CustomersOpportunities',
                    component: () => import('pages/Opportunities/Opportunities.vue')
                },
                {
                    path: '/introducers',
                    name: 'introducerList',
                    component: () => import('pages/Introducers/List.vue')
                },
            ]),

            ...routesWithPrefix('/customers/categories', [
                {
                    path: '/create',
                    name: 'CategoryCreate',
                    component: () => import('pages/CustomerCategories/Create.vue')
                },
                {path: '/edit/:id', name: 'CategoryEdit', component: () => import('pages/CustomerCategories/Edit.vue')},
                {path: '/list', name: 'CategoriesList', component: () => import('pages/CustomerCategories/List.vue')}
            ]),

            ...routesWithPrefix('/failure', [
                {path: '/edit/:id', name: 'FailureEdit', component: () => import('pages/Failure/Edit.vue')},
            ]),

            ...routesWithPrefix('/source', [
                {path: '/edit/:id', name: 'SourceEdit', component: () => import('pages/SourceCategories/Edit.vue')},
            ]),

            ...routesWithPrefix('/sms', [
                {path: '/edit/:id', name: 'SmsEdit', component: () => import('pages/SmsCategories/Edit.vue')},
            ]),


            ...routesWithPrefix('/accounting', [
                // {path: '/create', name: 'InvoiceCreate', component: () => import('pages/Accounting/Create.vue')},
                // {path: '/edit/:id', name: 'InvoiceEdit', component: () => import('pages/Accounting/Edit.vue')},
                // {path: '/list', name: 'InvoicesList', component: () => import('pages/Accounting/List.vue')}
            ]),


            ...routesWithPrefix('/automation', [
                {path: '/quick-pre-invoice', name: 'CreateQuickPreInvoice', component: () => import('pages/Automation/CreateQuick.vue')},
                {path: '/create', name: 'CreateRequest', component: () => import('pages/Automation/Create.vue')},
                {path: '/edit/:id', name: 'EditAutomation', component: () => import('pages/Automation/Edit.vue')},
                {path: '/list/final', name: 'ListFinal', component: () => import('pages/Automation/ListFinal.vue')},
                {
                    path: '/list/canseling',
                    name: 'listcanseling',
                    component: () => import('pages/Automation/listCanseling.vue')
                },
                {
                    path: '/list/request',
                    name: 'ListRequest',
                    component: () => import('pages/Automation/ListRequest.vue')
                },
                {
                    path: '/list/pre-invoice',
                    name: 'ListPreInvoice',
                    component: () => import('pages/Automation/ListPreInvoice.vue')
                },
                {
                    path: '/list/contract',
                    name: 'ListContract',
                    component: () => import('pages/Automation/ListContract.vue')
                },
            ]),


            ...routesWithPrefix('/products', [
                {path: '/create', name: 'ProductCreate', component: () => import('pages/Products/Create.vue')},
                {path: '/edit/:id', name: 'ProductEdit', component: () => import('pages/Products/Edit.vue')},
                {path: '/list', name: 'ProductsList', component: () => import('pages/Products/List.vue')},
                // {
                //     path: '/advance',
                //     name: 'ProductAdvanceCreate',
                //     component: () => import('pages/Products/advanceCreate.vue')
                // },
                {
                    path: '/editInventory/:id',
                    name: 'editInventory',
                    component: () => import('pages/Products/editInventory.vue')
                },
                {
                    path: '/editCategoryProduct/:id',
                    name: 'editCategoryProduct',
                    component: () => import('pages/Products/editCategoryProduct.vue')
                },

            ]),

            ...routesWithPrefix('/bank-accounts', [
                // {path: '/create', name: 'BankAccountCreate', component: () => import('pages/BankAccounts/Create.vue')},
                // {path: '/edit/:id', name: 'BankAccountEdit', component: () => import('pages/BankAccounts/Edit.vue')},
                // {path: '/list', name: 'BankAccountsList', component: () => import('pages/BankAccounts/List.vue')}
            ]),

            ...routesWithPrefix('/reminders', [
                {path: '/create', name: 'ReminderCreate', component: () => import('pages/Reminders/Create.vue')},
                {path: '/edit/:id', name: 'ReminderEdit', component: () => import('pages/Reminders/Edit.vue')},
                {path: '/list/normal', name: 'RemindersList', component: () => import('pages/Reminders/List.vue')},
            ]),

            ...routesWithPrefix('/install-services', [
                {
                    path: '/create',
                    name: 'InstallServiceCreate',
                    component: () => import('pages/InstallServices/Create.vue')
                },
                {path: '/list', name: 'InstallServiceList', component: () => import('pages/InstallServices/List.vue')},
                {
                    path: '/edit/:id',
                    name: 'InstallServiceEdit',
                    component: () => import('pages/InstallServices/Edit.vue')
                }
            ]),

            ...routesWithPrefix('/after-sale-service', [
                {
                    path: '/create',
                    name: 'AfterSalesServiceCreate',
                    component: () => import('pages/AfterSalesService/Create.vue')
                },
                {
                    path: '/list',
                    name: 'AfterSalesServiceList',
                    component: () => import('pages/AfterSalesService/List.vue')
                },
                {
                    path: '/edit/:id',
                    name: 'AfterSalesServiceEdit',
                    component: () => import('pages/AfterSalesService/Edit.vue')
                }
            ]),

            ...routesWithPrefix('/sms', [
                {path: '/create', name: 'SmsCreate', component: () => import('pages/Sms/Create.vue')},
                {path: '/list', name: 'SmsList', component: () => import('pages/Sms/List.vue')}
            ]),

            ...routesWithPrefix('/checks', [
                // {path: '/create', name: 'CheckCreate', component: () => import('pages/Checks/Create.vue')},
                // {path: '/edit/:id', name: 'CheckEdit', component: () => import('pages/Checks/Edit.vue')},
                // {path: '/list', name: 'ChecksList', component: () => import('pages/Checks/List.vue')}
            ]),

            ...routesWithPrefix('/customers/calls', [
                {path: '/create/:id', name: 'CallCreate', component: () => import('pages/Calls/Create.vue')},
                {path: '/edit/:id', name: 'CallEdit', component: () => import('pages/Calls/Edit.vue')}
            ]),

            ...routesWithPrefix('/official', [
                {
                    path: '/create/ticket',
                    name: 'TicketCreate',
                    component: () => import('pages/Official/Ticket/create.vue')
                },
                {
                    path: '/ticket/edit/:id',
                    name: 'TicketEdit',
                    component: () => import('pages/Official/Ticket/edit.vue')
                },
                {path: '/list/ticket', name: 'TicketList', component: () => import('pages/Official/Ticket/list.vue')},
            ]),

            ...routesWithPrefix('/users/report', [
                {path: '/list', name: 'UserReport', component: () => import('pages/UserReport/UserReport.vue')},
            ]),

        ]
    },

    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue')
    }
]


export default routes
