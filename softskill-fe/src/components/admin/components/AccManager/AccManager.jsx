import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { FilterMatchMode } from 'primereact/api';
import { RadioButton } from 'primereact/radiobutton';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useDispatch, useSelector } from 'react-redux';
import './AccManager.scss';
import { addAccount, deleteAccounts, getAccount, updateAccount } from '../../../../redux/thunks/admin/acc-thunks';
import { getUserInfo } from '../../../../redux/thunks/auth-thunks';

function AccManager() {
    const dispatch = useDispatch();
    let emptyAccount = {
        id: -1,
        no: -1,
        name: '',
        mail: '',
        roleId: '1',
        role: 'ADMIN',
        createdDate: '',
        status: 'INSTOCK',
    };

    const [accounts, setAccounts] = useState(null);
    const [accountDialog, setAccountDialog] = useState(false);
    const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
    const [deleteAccountsDialog, setDeleteAccountsDialog] = useState(false);
    const [account, setAccount] = useState(emptyAccount);
    const [info, setInfo] = useState(false);
    const [addAcc, setAddAcc] = useState(false);
    const [selectedAccounts, setSelectedAccounts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        dispatch(getAccount());
        dispatch(getUserInfo());
    }, []);

    const acc = useSelector((state) => {
        return state.accData.accounts;
    });

    const accType = useSelector((state) => {
        return state.accData.accType;
    });

    const message = useSelector((state) => {
        return state.accData.success;
    });

    const userAuth = useSelector((state) => state.authData.user);
    useEffect(() => {
        if (accType === 'load') {
            setAccounts(acc);
        } else if (accType === 'add') {
            if (message !== 'errorMessage') {
                toast.current.show({
                    severity: 'success',
                    summary: 'Th??nh c??ng',
                    detail: 'G???i y??u c???u th??nh c??ng!',
                    life: 3000,
                });
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Th???t b???i',
                    detail: 'Email kh??ng h???p l??? ho???c B???n ???? g???i y??u c???u cho ng?????i n??y tr?????c ????!',
                    life: 5000,
                });
            }
        }
    }, [acc, accType]);

    // const openNew = () => {
    //     setAccount(emptyAccount);
    //     setSubmitted(false);
    //     setAccountDialog(true);
    // };

    const onStatusChange = (e) => {
        let _account = { ...account };
        _account['status'] = e.value;
        setAccount(_account);
    };

    const onRoleChange = (e) => {
        let _account = { ...account };
        _account['roleId'] = e.value;
        e.value === '1'
            ? (_account['role'] = 'ADMIN')
            : e.value === '2'
            ? (_account['role'] = 'AUTHOR')
            : (_account['role'] = 'USER');
        setAccount(_account);
    };

    const onInputChange = (e) => {
        const val = (e.target && e.target.value) || '';
        let _account = { ...account };
        _account['mail'] = val;
        setAccount(_account);
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilter(value);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setAccountDialog(false);
    };

    const hideInfoDialog = () => {
        setInfo(false);
    };

    const openInfoDialog = () => {
        setInfo(true);
    };

    const hideAddDialog = () => {
        setAddAcc(false);
        setSubmitted(false);
    };

    const openAddDialog = () => {
        setAccount(emptyAccount);
        setAddAcc(true);
    };

    const hideDeleteAccountDialog = () => {
        setDeleteAccountDialog(false);
    };

    const hideDeleteAccountsDialog = () => {
        setDeleteAccountsDialog(false);
    };

    const saveAccount = () => {
        setSubmitted(true);

        if (account.name.trim()) {
            let _accounts = [...accounts];
            let _account = { ...account };
            if (_account.id !== -1) {
                if (userAuth?.userDetails.mail === _account.mail) {
                    openInfoDialog();
                } else {
                    dispatch(
                        updateAccount({
                            id: _account.id,
                            roleId: _account.roleId,
                            status: _account.status,
                        }),
                    );
                    const index = findIndexById(account.id);

                    _accounts[index] = _account;
                    toast.current.show({
                        severity: 'success',
                        summary: 'Th??nh c??ng',
                        detail: 'C???p nh???t th??nh c??ng!',
                        life: 3000,
                    });
                }
            } else {
                // _accounts.push(_account);
                // toast.current.show({
                //     severity: 'success',
                //     summary: 'Th??nh c??ng',
                //     detail: 'Account Created',
                //     life: 3000,
                // });
                // console.log(_account);
            }

            setAccounts(_accounts);
            setAccountDialog(false);
            setAccount(emptyAccount);
        } else if (account.mail.trim()) {
            let _account = { ...account };
            if (_account.id === -1) {
                if (checkExistEmail(_account.mail)) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Th???t b???i',
                        detail: 'Email n??y ???? ???????c ????ng k?? tr??n trang web!',
                        life: 3000,
                    });
                } else {
                    dispatch(
                        addAccount({
                            mail: _account.mail,
                            role: _account.role,
                        }),
                    );
                    setAccount(emptyAccount);
                    hideAddDialog();
                }
            }
        }
    };

    const checkExistEmail = (mail) => {
        for (let index = 0; index < accounts.length; index++) {
            const element = accounts[index];
            if (element.mail === mail) {
                return true;
            }
        }
        return false;
    };

    const editAccount = (account) => {
        setAccount({ ...account });
        setAccountDialog(true);
    };

    const confirmDeleteAccount = (account) => {
        setAccount(account);
        setDeleteAccountDialog(true);
    };

    const deleteAccount = () => {
        let ids = [account.id];
        let index = findIndexById(ids[0]);
        if (index !== -1) {
            let acc = accounts[index];
            if (acc.mail === localStorage.getItem('mail')) {
                openInfoDialog();
                hideDeleteAccountDialog();
            } else {
                dispatch(deleteAccounts(ids));
                account.status = 'D???ng';
                let _accounts = accounts.filter((val) => (val.id !== account.id ? val : account));
                setAccounts(_accounts);
                setDeleteAccountDialog(false);
                setAccount(emptyAccount);
                toast.current.show({
                    severity: 'success',
                    summary: 'Th??nh c??ng',
                    detail: 'C???p nh???t th??nh c??ng!',
                    life: 3000,
                });
            }
        }
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const confirmDeleteSelected = () => {
        if (selectedAccounts.length === 1) {
            setAccount(selectedAccounts[0]);
            setDeleteAccountDialog(true);
        } else {
            setDeleteAccountsDialog(true);
        }
    };

    const deleteSelectedAccounts = () => {
        let ids = [];
        for (let index = 0; index < selectedAccounts.length; index++) {
            const element = selectedAccounts[index];
            ids.push(element.id);
        }
        let check = false;
        for (let index = 0; index < ids.length; index++) {
            const element = ids[index];
            let i = findIndexById(element);
            if (i !== -1) {
                let acc = accounts[i];
                if (acc.mail === localStorage.getItem('mail')) {
                    check = true;
                    break;
                }
            }
        }

        if (check === true) {
            openInfoDialog();
            hideDeleteAccountsDialog();
        } else {
            dispatch(deleteAccounts(ids));
            let _accounts = [...accounts];
            for (let index = 0; index < selectedAccounts.length; index++) {
                const element = selectedAccounts[index];
                element.status = 'D???ng';

                const i = findIndexById(ids[index]);
                _accounts[i] = element;
            }
            setAccounts(_accounts);
            setDeleteAccountsDialog(false);
            setSelectedAccounts(null);
            toast.current.show({
                severity: 'success',
                summary: 'Th??nh c??ng',
                detail: 'C???p nh???t th??nh c??ng!',
                life: 3000,
            });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                {/* <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} /> */}
                {/* <Button
                    label="X??a"
                    icon="pi pi-trash"
                    className="p-button-danger p-button-text"
                    style={{ margin: '0px' }}
                    onClick={confirmDeleteSelected}
                    disabled={!selectedAccounts || !selectedAccounts.length}
                /> */}
                <h3 className="mx-0 my-1">Qu???n l?? t??i kho???n</h3>
            </React.Fragment>
        );
    };

    const leftPagnitor = (
        <Button
            label="X??a t???t c???"
            className="p-button-text"
            style={{ margin: '0px', color: 'black', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}
            onClick={confirmDeleteSelected}
            disabled={!selectedAccounts || !selectedAccounts.length}
        />
    );

    const paginatorRight = <Button type="button" icon="pi pi-refresh" className="p-button-text" hidden />;

    const statusBodyTemplate = (rowData) => {
        return (
            <span
                className={`product-badge status-${rowData.status.toLowerCase()} ${
                    rowData.status === 'Ho???t ?????ng' ? 'text-success' : 'text-danger'
                }`}
            >
                {rowData.status}
            </span>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-warning mr-2"
                    onClick={() => editAccount(rowData)}
                />
                {/* <Button
                    icon="pi pi-ban"
                    className="p-button-rounded p-button-danger"
                    onClick={() => confirmDeleteAccount(rowData)}
                /> */}
            </React.Fragment>
        );
    };

    const header = (
        <div className="table-header">
            {/* <h5 className="mx-0 my-1">Qu???n l?? k??? n??ng</h5> */}
            <div className="flex justify-content-end">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="T??m ki???m" />
                </span>
            </div>
            <Button
                label="Th??m t??i kho???n"
                icon="pi pi-plus"
                style={{ fontSize: '12px' }}
                className="p-button-success mr-2"
                onClick={openAddDialog}
            />
        </div>
    );
    const accountDialogFooter = (
        <React.Fragment>
            <Button label="H???y" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="L??u" icon="pi pi-check" className="p-button-text" onClick={saveAccount} />
        </React.Fragment>
    );
    const deleteAccountDialogFooter = (
        <React.Fragment>
            <Button label="H???y" icon="pi pi-times" className="p-button-text" onClick={hideDeleteAccountDialog} />
            <Button label="X??c nh???n" icon="pi pi-check" className="p-button-text" onClick={deleteAccount} />
        </React.Fragment>
    );
    const deleteAccountsDialogFooter = (
        <React.Fragment>
            <Button label="H???y" icon="pi pi-times" className="p-button-text" onClick={hideDeleteAccountsDialog} />
            <Button label="X??c nh???n" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedAccounts} />
        </React.Fragment>
    );

    const infoDialogFooter = (
        <React.Fragment>
            <Button label="OK" icon="pi pi-check" className="p-button-text" onClick={hideInfoDialog} />
        </React.Fragment>
    );

    const addAccountsDialogFooter = (
        <React.Fragment>
            <Button label="H???y" icon="pi pi-times" className="p-button-text" onClick={hideAddDialog} />
            <Button label="X??c nh???n" icon="pi pi-check" className="p-button-text" onClick={saveAccount} />
        </React.Fragment>
    );

    return (
        <div className="acc-manager">
            <div className="datatable-crud-demo">
                <Toast ref={toast} />

                <div className="acc-card">
                    {/* <Toolbar left={leftToolbarTemplate}></Toolbar> */}

                    <DataTable
                        ref={dt}
                        value={accounts}
                        selection={selectedAccounts}
                        onSelectionChange={(e) => setSelectedAccounts(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        filters={filters}
                        paginatorLeft={leftPagnitor}
                        paginatorRight={paginatorRight}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="T???ng s???: {totalRecords} b???n ghi"
                        rowsPerPageOptions={[10, 20, 50]}
                        header={header}
                        emptyMessage="Ch??a c?? d??? li???u"
                        responsiveLayout="scroll"
                        style={{ fontSize: '12px' }}
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false}></Column>
                        <Column field="id" header="ID" hidden></Column>
                        <Column field="no" header="STT" sortable style={{ minWidth: '3rem' }}></Column>
                        <Column field="name" header="T??n T??i Kho???n" sortable style={{ minWidth: '10rem' }}></Column>
                        <Column field="mail" header="Email" sortable style={{ minWidth: '10rem' }}></Column>
                        <Column field="role" header="Lo???i t??i kho???n" sortable style={{ minWidth: '6rem' }}></Column>
                        <Column
                            field="status"
                            header="Tr???ng th??i"
                            body={statusBodyTemplate}
                            sortable
                            style={{ minWidth: '8rem' }}
                        ></Column>
                        <Column
                            field="createdDate"
                            header="Ng??y tham gia"
                            sortable
                            style={{ minWidth: '10rem' }}
                        ></Column>
                        <Column
                            header="Thao t??c"
                            body={actionBodyTemplate}
                            exportable={false}
                            style={{ minWidth: '8rem' }}
                        ></Column>
                    </DataTable>
                </div>

                <Dialog
                    visible={accountDialog}
                    style={{ width: '450px' }}
                    draggable={false}
                    header="Th??ng tin t??i kho???n"
                    modal
                    className="p-fluid"
                    footer={accountDialogFooter}
                    onHide={hideDialog}
                >
                    {/* {account.image && (
                        <img
                            src={`images/account/${account.image}`}
                            onError={(e) =>
                                (e.target.src = 'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png')
                            }
                            alt={account.image}
                            className="account-image block m-auto pb-3"
                        />
                    )} */}
                    <div className="field">
                        <label htmlFor="name">T??n t??i kho???n</label>
                        <InputText
                            id="name"
                            value={account.name}
                            readOnly
                            className={classNames({ 'p-invalid': submitted && !account.name })}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="mail">Email</label>
                        <InputText
                            id="mail"
                            value={account.mail}
                            readOnly
                            className={classNames({ 'p-invalid': submitted && !account.mail })}
                        />
                    </div>
                    <div className="field">
                        <label className="mb-3 mt-3 font-weight-bold">Lo???i t??i kho???n</label>
                        <div className="formgrid grid">
                            <div className="field-radiobutton col-6 mb-2">
                                <RadioButton
                                    inputId="role1"
                                    name="role"
                                    value="1"
                                    onChange={onRoleChange}
                                    checked={account.roleId === '1'}
                                />
                                <label htmlFor="role2" className="text-primary ml-2">
                                    ADMIN
                                </label>
                            </div>
                            <div className="field-radiobutton col-6 mb-2">
                                <RadioButton
                                    inputId="role2"
                                    name="role"
                                    value="2"
                                    onChange={onRoleChange}
                                    checked={account.roleId === '2'}
                                />
                                <label htmlFor="role2" className="text-primary ml-2 mt-2">
                                    AUTHOR
                                </label>
                            </div>
                            <div className="field-radiobutton col-6">
                                <RadioButton
                                    inputId="role3"
                                    name="role"
                                    value="3"
                                    onChange={onRoleChange}
                                    checked={account.roleId === '3'}
                                />
                                <label htmlFor="role2" className="text-primary ml-2 pt-2">
                                    USER
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="field">
                        <label className="mb-3 mt-3 font-weight-bold">Tr???ng th??i</label>
                        <div className="formgrid grid">
                            <div className="field-radiobutton col-6 mb-2">
                                <RadioButton
                                    inputId="status1"
                                    name="Status"
                                    value="Ho???t ?????ng"
                                    onChange={onStatusChange}
                                    checked={account.status === 'Ho???t ?????ng'}
                                />
                                <label htmlFor="category1" className="text-success ml-2">
                                    Ho???t ?????ng
                                </label>
                            </div>
                            <div className="field-radiobutton col-6">
                                <RadioButton
                                    inputId="status2"
                                    name="Status"
                                    value="D???ng"
                                    onChange={onStatusChange}
                                    checked={account.status === 'D???ng'}
                                />
                                <label htmlFor="category2" className="text-danger ml-2 mt-2">
                                    D???ng
                                </label>
                                {account.status === 'D???ng' && (
                                    <small className="p-error">
                                        <br />
                                        T??i kho???n <b>{account.name}</b> s??? kh??ng th??? v??o ???????c trang web n???a. B???n n??n
                                        ch???c ch???n v??? ??i???u ????
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>
                </Dialog>

                <Dialog
                    visible={deleteAccountDialog}
                    draggable={false}
                    style={{ width: '450px' }}
                    header="X??a?"
                    modal
                    footer={deleteAccountDialogFooter}
                    onHide={hideDeleteAccountDialog}
                >
                    <div className="confirmation-content" style={{ fontFamily: 'Helvetica', fontSize: '1.2rem' }}>
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {account && (
                            <span>
                                Vi???c n??y s??? khi???n <b>{account.name}</b> kh??ng th??? v??o ???????c trang web n??y n???a. <br />
                                <label className="ml-5">B???n c?? ch???c ch???n?</label>
                            </span>
                        )}
                    </div>
                </Dialog>

                <Dialog
                    visible={deleteAccountsDialog}
                    draggable={false}
                    style={{ width: '450px' }}
                    header="X??a?"
                    modal
                    footer={deleteAccountsDialogFooter}
                    onHide={hideDeleteAccountsDialog}
                >
                    <div className="confirmation-content" style={{ fontFamily: 'Helvetica', fontSize: '1.2rem' }}>
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {account && (
                            <span>
                                Vi???c n??y s??? khi???n t???t c??? c??c t??i kho???n tr??n kh??ng th??? v??o ???????c trang web n??y n???a. <br />
                                <label className="ml-5">B???n c?? ch???c ch???n?</label>
                            </span>
                        )}
                    </div>
                </Dialog>

                <Dialog
                    visible={info}
                    draggable={false}
                    style={{ width: '450px', borderRadius: '0' }}
                    dismissableMask
                    header="Th??ng b??o"
                    modal
                    footer={infoDialogFooter}
                    onHide={hideInfoDialog}
                    contentStyle={{ borderRadius: '0px' }}
                >
                    <div className="confirmation-content" style={{ fontFamily: 'Helvetica', fontSize: '1.2rem' }}>
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        <span>B???n kh??ng th??? thao t??c v???i t??i kho???n c???a ch??nh m??nh!</span>
                    </div>
                </Dialog>

                <Dialog
                    visible={addAcc}
                    style={{ width: '450px', borderRadius: '0' }}
                    draggable={false}
                    header="Th??m t??i kho???n"
                    modal
                    footer={addAccountsDialogFooter}
                    onHide={hideAddDialog}
                    contentStyle={{ borderRadius: '0px' }}
                >
                    <div className="field">
                        <label className="mb-3 mt-3 font-weight-bold d-block" htmlFor="email">
                            Email
                            <br />
                        </label>
                        <InputText
                            id="email"
                            value={account.mail}
                            style={{ width: '-webkit-fill-available' }}
                            autoFocus
                            maxLength={50}
                            keyfilter="email"
                            onChange={onInputChange}
                            className={classNames({ 'p-invalid': submitted && !account.mail })}
                        />
                        {submitted && !account.mail.trim() && (
                            <small className="p-error">Email kh??ng ???????c ????? tr???ng</small>
                        )}
                    </div>
                    <div className="field">
                        <label className="mb-3 mt-3 font-weight-bold">Lo???i t??i kho???n</label>
                        <div className="formgrid grid">
                            <div className="field-radiobutton col-6 mb-2">
                                <RadioButton
                                    inputId="role1"
                                    name="role"
                                    value="1"
                                    onChange={onRoleChange}
                                    checked={account.roleId === '1'}
                                />
                                <label htmlFor="role2" className="text-primary ml-2">
                                    ADMIN
                                </label>
                            </div>
                            <div className="field-radiobutton col-6 mb-2">
                                <RadioButton
                                    inputId="role2"
                                    name="role"
                                    value="2"
                                    onChange={onRoleChange}
                                    checked={account.roleId === '2'}
                                />
                                <label htmlFor="role2" className="text-primary ml-2 mt-2">
                                    AUTHOR
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="field mt-3">
                        <label>Sau khi nh???n X??c nh???n, vui l??ng ch??? ph???n h???i t??? ng?????i nh???n</label>
                    </div>
                </Dialog>
            </div>
        </div>
    );
}

export default AccManager;
