import React, { useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { Tree, Input } from "antd";
import { DownOutlined } from "@ant-design/icons";

const data = [
  { title: "马云", key: 1 },
  { title: "前端技术专家", key: 3, parent: 2 },
  { title: "首席科学家", key: 2, parent: 1 },
  { title: "前端架构师", key: 4, parent: 3 },
  { title: "前端工程师", key: 5, parent: 4 },
  { title: "前端菜鸟花花", key: 6, parent: 5 },
  { title: "前端小白", key: 7, parent: 6 },
  { title: "马化腾", key: 8 },
  { title: "QQ", key: 9, parent: 8 },
  { title: "微信", key: 10, parent: 8 },
  { title: "王者荣耀", key: 11, parent: 8 },
  { title: "绝地求生", key: 12, parent: 8 },
  { title: "QQ会员", key: 13, parent: 9 },
  { title: "QQ空间", key: 14, parent: 9 },
  { title: "QQ钱包", key: 15, parent: 9 },
  { title: "沙漠地图", key: 16, parent: 12 },
  { title: "公众号", key: 17, parent: 10 },
  { title: "群聊", key: 18, parent: 10 },
  {title:"cc",key:23,parent:10},
  { title: "小程序", key: 19, parent: 10 },
  { title: "花木兰", key: 20, parent: 11 },
  { title: "芈月", key: 21, parent: 11 },
  { title: "马可波罗", key: 22, parent: 11 },
];

const treeData = [
  {
    title: "太极",
    key: 1,
    children: [
      {
        title: "两仪",
        key: 2,
        parent: 1,
        children: [
          {
            title: "老阳",
            key: 3,
            parent: 2,
            children: [{ title: "乾卦", key: 7, parent: 3 }],
          },
          {
            title: "少阳",
            key: 4,
            parent: 2,
            children: [
              { title: "巽卦", key: 9, parent: 4 },
              { title: "兑卦", key: 10, parent: 4 },
              { title: "离卦", key: 11, parent: 4 },
            ],
          },
          {
            title: "老阴",
            key: 5,
            parent: 2,
            children: [{ title: "坤卦", key: 8, parent: 5 }],
          },
          {
            title: "少阴",
            key: 6,
            parent: 2,
            children: [
              { title: "艮卦", key: 12, parent: 6 },
              { title: "坎卦", key: 13, parent: 6 },
              { title: "震卦", key: 14, parent: 6 },
            ],
          },
        ],
      },
    ],
  },
];

const getTree = (data) => {
  const temp = cloneDeep(data);
  const parents = temp.filter((item) => !item.parent); //过滤出最高父集
  const children = temp.filter((item) => item.parent);
  children.forEach((item) => {
    const node = temp.find((el) => el.key === item.parent);
    node &&
      (node.children ? node.children.push(item) : (node.children = [item]));
  });
  return parents;
};

const getFlatData = (data) => {
  const flagData = [];
  data.forEach((item) => {
    const { children, ...node } = item;
    flagData.push(node);
    children &&
      children.forEach((el) => {
        el.parents = (item.parents ? item.parents + "," : "") + item.key;
      }); //设置当前元素的所有父级。
    children && flagData.push(...getFlatData(children));
  });
  return flagData;
};

const SearchTree = () => {
  const [expands, setExpands] = useState(() => data.map((item) => item.key));
  const flatData = useRef({});
  const [treeData, setTreeData] = useState(() => {
    const tree = getTree(data);
    flatData.current.flat = getFlatData(tree);
    flatData.current.tree = tree;
    return tree;
  });
  const [searchKey, setKey] = useState("");

  const handleSearch = (e) => {
    try {
      const v = e?.target?.value?.trim();
      setKey(v);
      if (!v?.length) {
        //v值为空，初始化tree，默认全部展开

        setExpands(data.map((item) => item.key));
        setTreeData([...flatData.current.tree]);
      } else {
        //搜索内容为空，获取搜索项和其父级，实时生成tree

        const keys = flatData.current.flat.filter((item) =>
          item?.title?.includes(v)
        ); //获取搜索到的项

        if (!keys?.length) {
          //没有搜到，将tree置为空，比如搜索“木兰小宝贝”,就会什么都没有
          setExpands([]);
          setTreeData([]);
          return;
        }

        //以下逻辑处理keys不为空的情况

        const expandsTemp = []; //需要展开的key
        const list = []; //存搜索项和其父级的数组

        keys?.forEach((item) => {
          const data = item.parents?.split(",").filter(Boolean); //拆分parents属性，获取当前项所有父级
          data &&
            data.forEach((el) => {
              if (expandsTemp.every((_el) => _el !== el)) {
                expandsTemp.push(el); //此判断保证expandsTemp里key值不重复
              }
            });
          list.push(item);
        });

        expandsTemp.forEach((item) => {
          if (list.every((el) => el.key?.toString() !== item)) {
            //list里元素key值也要唯一。
            const node = flatData.current.flat.find(
              (el) => el.key?.toString() === item
            );
            node && list.push(node);
          }
        }); //遍历expandsTemp，往list里添加搜索项的父级元素。

        const tempTree = getTree(list); //根据list组装tree
        setExpands([...expandsTemp.map((item) => Number(item))]); //map的作用是将expandsTemp里的key全部转为number;
        setTreeData([...tempTree]); //设置实时tree
      }
    } catch (e) {}
  };

  return (
    <div
      style={{
        width: 399,
        height: 399,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Input onChange={handleSearch} />
      <div style={{ flex: "1", minHeight: 0, overflow: "auto" }}>
        <Tree
          showIcon
          defaultExpandAll
          expandedKeys={expands}
          switcherIcon={<DownOutlined />}
          treeData={treeData}
          titleRender={(node) => {
            return (
              <span
                style={{
                  background:
                    searchKey && node?.title?.includes(searchKey)
                      ? "skyblue"
                      : "",
                  color:
                    searchKey && node?.title?.includes(searchKey) ? "red" : "",
                }}
              >
                {node?.title}
              </span>
            );
          }}
        />
      </div>
    </div>
  );
};

export default SearchTree;
