import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import { styled } from '@mui/material/styles';
import { TreeView, TreeItem } from '@mui/lab';
import { ExpandMore, ChevronRight } from '@mui/icons-material';

const ITEMS = [
  {
    id: '1',
    label: 'Website',
    children: [
      { id: '1.1', label: 'Home', color: 'green' },
      { id: '1.2', label: 'Pricing', color: 'green' },
      { id: '1.3', label: 'About us', color: 'green' },
      {
        id: '1.4',
        label: 'Blog',
        children: [
          { id: '1.1.1', label: 'Announcements', color: 'blue' },
          { id: '1.1.2', label: 'April lookahead', color: 'blue' },
          { id: '1.1.3', label: "What's new", color: 'blue' },
          { id: '1.1.4', label: 'Meet the team', color: 'blue' },
        ],
      },
    ],
  },
  {
    id: '2',
    label: 'Store',
    children: [
      { id: '2.1', label: 'All products', color: 'green' },
      {
        id: '2.2',
        label: 'Categories',
        children: [
          { id: '2.2.1', label: 'Gadgets', color: 'blue' },
          { id: '2.2.2', label: 'Phones', color: 'blue' },
          { id: '2.2.3', label: 'Wearables', color: 'blue' },
        ],
      },
      { id: '2.3', label: 'Bestsellers', color: 'green' },
      { id: '2.4', label: 'Sales', color: 'green' },
    ],
  },
  { id: '4', label: 'Contact', color: 'blue' },
  { id: '5', label: 'Help', color: 'blue' },
];

function DotIcon({ color }) {
  return (
    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
      <svg width={6} height={6}>
        <circle cx={3} cy={3} r={3} fill={color} />
      </svg>
    </Box>
  );
}

DotIcon.propTypes = {
  color: PropTypes.string.isRequired,
};

function CustomTreeItem({ nodeId, label, color, children }) {
  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {color && <DotIcon color={color} />}
          <Typography variant="body2">{label}</Typography>
        </Box>
      }
    >
      {children}
    </TreeItem>
  );
}

CustomTreeItem.propTypes = {
  nodeId: PropTypes.string.isRequired,
  label: PropTypes.string,
  color: PropTypes.string,
  children: PropTypes.node,
};

function renderTree(items) {
  return items.map((item) => (
    <CustomTreeItem key={item.id} nodeId={item.id} label={item.label} color={item.color}>
      {item.children ? renderTree(item.children) : null}
    </CustomTreeItem>
  ));
}

export default function CustomizedTreeView() {
  return (
    <Card variant="outlined" sx={{ flexGrow: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Product tree
        </Typography>
        <TreeView
          defaultCollapseIcon={<ExpandMore />}
          defaultExpandIcon={<ChevronRight />}
          defaultExpanded={['1', '1.4']}
          defaultSelected={['1.1', '1.1.1']}
          sx={{ overflowY: 'auto', maxHeight: 400 }}
          multiSelect
        >
          {renderTree(ITEMS)}
        </TreeView>
      </CardContent>
    </Card>
  );
}
