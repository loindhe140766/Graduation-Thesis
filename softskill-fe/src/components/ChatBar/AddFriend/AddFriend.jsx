import React, { useEffect, useRef, useState } from 'react';
import './AddFriend.scss';
import { Modal } from 'react-bootstrap';
import { Avatar, InputText } from 'primereact';
import { useDispatch, useSelector } from 'react-redux';
import { UilUserTimes, UilSearch } from '@iconscout/react-unicons';
import {
    acceptFriendRequest,
    addFriend,
    deleteFriend,
    denyFriendRequest,
    formReset,
    getFriendList,
    getFriendsBySearch,
    getFriendsRecent,
} from '../../../redux/thunks/friend-thunks';

const AddFriend = (props) => {
    const dispatch = useDispatch();

    const friendsGetter = useSelector((state) => state.friends.friendsSearch);

    const [friends, setFriends] = useState([]);
    const [typeFriend, setTypeFriend] = useState('suggest');

    const [textSearch, setTextSearch] = useState('');

    useEffect(() => {
        setFriends(friendsGetter);
        setTypeFriend('friendsGetter');
    }, [friendsGetter]);

    useEffect(() => {
        if (props?.show === true) {
            setFriends(props?.friends);
            setTypeFriend('suggest');
        }
    }, [props?.friends, props?.show]);

    useEffect(() => {
        if (textSearch === '') {
            setFriends(props?.friends);
            setTypeFriend('suggest');
        }
    }, [props?.friends, textSearch]);

    const handleSearchFriend = (e, isClick) => {
        if (((e.which === 13 && !e.shiftKey) || isClick === true) && textSearch !== '') {
            dispatch(getFriendsBySearch(textSearch));
        }
    };

    const handleAddFriend = async (e, id) => {
        dispatch(formReset());
        if (e === 'deleteFriend' || e === 'deleteSended') {
            await dispatch(deleteFriend(id));
        } else if (e === 'acceptInvite') {
            await dispatch(
                acceptFriendRequest({
                    id: id,
                    action: 'accept',
                }),
            );
        } else if (e === 'deleteInvite') {
            await dispatch(
                denyFriendRequest({
                    id: id,
                    action: 'deny',
                }),
            );
        } else if (e === 'addFriend') {
            await dispatch(
                addFriend({
                    id: id,
                }),
            );
        }

        if (typeFriend === 'suggest') {
            await dispatch(getFriendsRecent());
        } else {
            await dispatch(getFriendsBySearch(textSearch));
        }
        await dispatch(getFriendList());
    };

    // Click outside action
    const actionRef = useRef(null);
    useOutsideAction(actionRef);

    const [showIdEdit, setShowIdEdit] = useState(0);
    function useOutsideAction(ref) {
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (ref.current && !ref.current.contains(event.target)) {
                    setShowIdEdit(0);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [ref]);
    }
    const handleOpen = (e, id) => {
        if (id === showIdEdit) {
            setShowIdEdit(0);
        } else {
            setShowIdEdit(id);
        }
    };

    return (
        <React.Fragment>
            <Modal
                {...props}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                className="modal-add-friend"
            >
                <Modal.Header closeButton="true" style={{ padding: '15px 15px 0px' }}>
                    <Modal.Title id="contained-modal-title-vcenter" className="w-100">
                        <h2 className="text-center mb-4 font-weight-bold">TH??M B???N</h2>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div className="col-12 pb-3 modal-invite-body">
                        <div className="p-inputgroup">
                            <InputText
                                maxLength={50}
                                placeholder="Nh???p t??n ng?????i d??ng ho???c email ????? g???i l???i m???i"
                                onChange={(e) => setTextSearch(e.target.value)}
                                onKeyPress={(e) => handleSearchFriend(e, false)}
                                className="border-0 invite-search invite-search-input"
                            />
                            <span
                                className="invite-search invite-search-icon border-0"
                                onClick={(e) => handleSearchFriend(e, true)}
                            >
                                <UilSearch size={20} />
                            </span>
                        </div>
                    </div>
                    <ul className="list-group list-friend">
                        {typeFriend === 'suggest' ? (
                            <React.Fragment>
                                <h3 className="mb-0 mt-2">G???i ??</h3>
                                <i style={{ color: '#550000', fontSize: '1.4rem' }}>
                                    Nh???ng ng?????i tham gia ph??ng g???n ????y nh???t c??ng b???n
                                </i>
                            </React.Fragment>
                        ) : null}

                        {friends?.map((item, index) => (
                            <li className="list-group-item" key={index}>
                                <div className="row align-items-center justify-content-between">
                                    <div style={{ color: 'black' }} className="d-flex">
                                        {/* <Avatar shape="circle" image={item?.picture} /> */}
                                        <div className="item-image">
                                            <img
                                                src={
                                                    item?.picture === null
                                                        ? require('./../../../assets/image/user.png')
                                                        : item?.picture
                                                }
                                                onError={(e) =>
                                                    (e.target.src =
                                                        'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=2000')
                                                }
                                                alt="H??nh ???nh"
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <div className="font-size-18">{item?.name}</div>
                                            <i className="font-size-14">{item?.nickname}</i>
                                        </div>
                                    </div>
                                    {item?.status === 'isFriend' ? (
                                        <div ref={actionRef}>
                                            <button
                                                className="my-0 btn-add position-relative"
                                                type={'button'}
                                                onClick={() => handleOpen('deleteFriend', item?.id)}
                                            >
                                                B???n b??
                                            </button>
                                            {showIdEdit === item?.id ? (
                                                <div>
                                                    <div className="edit-content">
                                                        <div
                                                            className="item-action my-0 btn-delete separate-bottom"
                                                            onClick={() => handleAddFriend('deleteFriend', item?.id)}
                                                        >
                                                            <span>
                                                                <UilUserTimes size={18} />
                                                            </span>
                                                            <span style={{ marginLeft: '5px' }}> Hu??? k???t b???n</span>
                                                        </div>
                                                    </div>
                                                    <div className="corners"></div>
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : null}
                                    {item?.status === 'isSent' ? (
                                        <div>
                                            <button
                                                className="my-0 btn-invite"
                                                type={'button'}
                                                onClick={() => handleAddFriend('deleteSended', item?.id)}
                                            >
                                                Hu??? l???i m???i
                                            </button>
                                        </div>
                                    ) : null}
                                    {item?.status === 'isReceived' ? (
                                        <div>
                                            <button
                                                className="my-0 btn-invite"
                                                type={'button'}
                                                onClick={() => handleAddFriend('acceptInvite', item?.id)}
                                            >
                                                X??c nh???n
                                            </button>

                                            <button
                                                className="my-0 btn-delete"
                                                type={'button'}
                                                onClick={() => handleAddFriend('deleteInvite', item?.id)}
                                            >
                                                Xo??
                                            </button>
                                        </div>
                                    ) : null}
                                    {item?.status === 'nothing' ? (
                                        <div>
                                            <button
                                                className="my-0 btn-add"
                                                type={'button'}
                                                onClick={() => handleAddFriend('addFriend', item?.id)}
                                            >
                                                Th??m b???n
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            </li>
                        ))}
                        {friends?.length === 0 && typeFriend === 'suggest' ? (
                            <h4 style={{ marginLeft: '32px' }}>Ch??a c?? ai tham gia g???n ????y c??ng b???n!</h4>
                        ) : friends?.length === 0 && typeFriend === 'friendsGetter' ? (
                            <h4 style={{ marginLeft: '32px' }}>Ng?????i b???n t??m kh??ng t???n t???i!</h4>
                        ) : null}
                    </ul>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    );
};

export default AddFriend;
