import React, { useContext } from 'react';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { logout } from '../../../MSAuth';
import { AuthContext } from '../../../contexts/AuthContext';
import styles from './LogoutButton.module.scss';

const LogoutButton = () => {
    const { auth, dispatch } = useContext(AuthContext);

    const history = useHistory();

    return (
        <div>
            <motion.button
                className={cx(
                    styles.logoutButton,
                    'button',
                    'has-text-white',
                    'is-paddingless'
                )}
                onClick={async () => {
                    try {
                        const user = await logout();
                        dispatch({ type: 'USER_LOGOUT', user });
                        history.push('/');
                    } catch (error) {
                        dispatch({ type: 'SET_AUTH_ERROR', error });
                    }
                }}
                whileHover={{ scale: 1.05 }}
            >
                <span className={cx('icon')}>
                    <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
                </span>
            </motion.button>
        </div>
    );
};

export default LogoutButton;
