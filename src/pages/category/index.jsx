import React, { Component } from 'react';
import { Card, Button, Icon, Table, Modal, message } from 'antd';

import { reqCategories, reqAddCategory, reqUpdateCategoryName } from '../../api';
import MyButton from '../../components/my-button';
import AddCategoryForm from './add-category-form';
import UpdateCategoryNameForm from './update-category-name';
import './index.less';

export default class Category extends Component {
  state = {
    categories: [],
    isShowAddCategory: false,
    isShowUpdateCategoryName: false, 
  };

  category = {};

  async componentDidMount() {
    const result = await reqCategories('0');
    if (result) {
      this.setState({categories: result});
    }
  };


 
  addCategory = () => {
 
    const { form } = this.addCategoryForm.props;

    form.validateFields(async (err, values) => {
      if (!err) {
      
        console.log(values);
        const { parentId, categoryName } = values;
        const result = await reqAddCategory(parentId, categoryName);

        if (result) {
        
          message.success('添加分类成功~', 2);
     
          form.resetFields(['parentId', 'categoryName']);

      
          const options = {
            isShowAddCategory: false
          };

          if (result.parentId === '0') {
            options.categories = [...this.state.categories, result];
          }

     
          this.setState(options);
        }
      }
    })
  };



  toggleDisplay = (stateName, stateValue) => {
    return () => {
      this.setState({
        [stateName]: stateValue
      })
    }
  };

  hideUpdateCategoryName = () => {

    this.updateCategoryNameForm.props.form.resetFields(['categoryName']);

    this.setState({
      isShowUpdateCategoryName: false
    })
  };

  saveCategory = (category) => {
    return () => {
 
      this.category = category;

      this.setState({
        isShowUpdateCategoryName: true
      })
    }
  };

  updateCategoryName = () => {
    const { form } = this.updateCategoryNameForm.props;

    form.validateFields(async (err, values) => {
      if (!err) {
        const { categoryName } = values;
        const categoryId = this.category._id;
        const result = await reqUpdateCategoryName(categoryId, categoryName);

        if (result) {
        
          const categories = this.state.categories.map((category) => {
            let { _id, name, parentId } = category;
            if (_id === categoryId) {
              name = categoryName;
              return {
                _id,
                name,
                parentId
              }
            }
       
            return category
          });

      
          form.resetFields(['categoryName']);

          message.success('更新分类名称成功~', 2);

          this.setState({
            isShowUpdateCategoryName: false,
            categories
          })
        }
      }
    })

  };

  render() {
    const { categories, isShowAddCategory, isShowUpdateCategoryName } = this.state;

    const columns = [
      {
        title: '品类名称',
        dataIndex: 'name',
      },
      {
        title: '操作',
       
        className: 'category-operation',
     
        render: category => {
    
          return <div>
            <MyButton onClick={this.saveCategory(category)}>修改名称</MyButton>
            <MyButton>查看其子品类</MyButton>
          </div>
        },
      },
    ];
  
    return <Card title="一级分类列表" extra={<Button type="primary" onClick={this.toggleDisplay('isShowAddCategory', true)}><Icon type="plus" />添加品类</Button>}>
      <Table
        columns={columns}
        dataSource={categories}
        bordered
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: ['3', '6', '9', '12'],
          defaultPageSize: 3,
          showQuickJumper: true
        }}
        rowKey="_id"
      />

      <Modal
        title="添加分类"
        visible={isShowAddCategory}
        onOk={this.addCategory}
        onCancel={this.toggleDisplay('isShowAddCategory', false)}
        okText="确认"
        cancelText="取消"
      >
        <AddCategoryForm categories={categories} wrappedComponentRef={(form) => this.addCategoryForm = form}/>
      </Modal>

      <Modal
        title="修改分类名称"
        visible={isShowUpdateCategoryName}
        onOk={this.updateCategoryName}
        onCancel={this.hideUpdateCategoryName}
        okText="确认"
        cancelText="取消"
        width={250}
      >
        <UpdateCategoryNameForm categoryName={this.category.name} wrappedComponentRef={(form) => this.updateCategoryNameForm = form}/>
      </Modal>

    </Card>;
  }
}
