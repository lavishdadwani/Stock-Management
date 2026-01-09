import React from 'react'
import RcPagination from "rc-pagination"
import "rc-pagination/assets/index.css"

const Pagination = (props) => {
  return (
    <RcPagination
    style={{margin:"10px 0"}}
    className='flex justify-end items-center'
    locale="en_US"
    showTotal={(total) => (
        <p className='text-sm text-gray-500 italic'>
            <span className='hidden sm:block'>Total Record - {total}</span>
            <span className='sm:hidden'>{total} records</span>
        </p>
    )}
    {...props}
    />
  )
}

export default Pagination
