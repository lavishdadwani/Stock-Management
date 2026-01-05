import React from 'react'
import Loader from './LoadingMessage'
import Modal from '../modal/Modal'

const LoaderModal = (props) => {
  return (
    <Modal legacy={true} isOpen={props.isOpen} className='text-center'>
        <Loader {...props}  />
        </Modal>
  )
}

export default LoaderModal
