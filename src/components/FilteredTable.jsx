import React, { useState, useEffect, useCallback } from "react";
import useAxios from "axios-hooks";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import Spinner from "./Spinner";
import { DataGrid } from "@mui/x-data-grid";
import { Select, MenuItem, TextField } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { GridActionsCellItem, GridRowModes } from "@mui/x-data-grid";
import CustomTextFieldEditor from "./customTextFieldEditor";

dayjs.extend(isBetween);

const endPoint =
  "https://script.google.com/macros/s/AKfycbx5AAww6De17U5lkbTr2xCV8h6eXps0BWoZR5vb_cZyBj9JmunsuP9yAESMZm6rHJDSHg/exec";

export default function FilteredTable() {
  const [{ data: dataTypes, loading: typeLoading, error: TypeError }] =
    useAxios(endPoint);
  const [{ data, loading, error }] = useAxios(
    endPoint + "?route=getBreakdowns"
  );
  const [
    { data: postData, loading: postLoading, error: postError },
    executePost,
  ] = useAxios(
    {
      url: endPoint + "?route=editBreakdowns",
      method: "POST",
    },
    { manual: true }
  );
  const [filteredData, setFilteredData] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [gridKey, setGridKey] = useState(0);
  const [editRowsModel, setEditRowsModel] = useState({});
  const [categoriesAndSubcategories, setCategoriesAndSubcategories] = useState(
    {}
  );

  const handleEditClick = (id) => () => {
    const category = filteredData[id]["Repair Category"];
    const subcategory = filteredData[id]["Repair SubCategory"];

    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);

    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const [editStates, setEditStates] = useState({});

  const handleSaveClick = (id) => () => {
    if (editStates[id]) {
      const updatedRow = {
        ...filteredData[id],
        ...editStates[id],
      };

      console.log("Datos antes de la actualización:", filteredData[id]);

      const updatedData = [...filteredData];
      updatedData[id] = updatedRow;

      console.log("Datos después de la actualización:", updatedData[id]);

      setFilteredData(updatedData);

      const updatedEditStates = { ...editStates };
      delete updatedEditStates[id];
      setEditStates(updatedEditStates);

      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });

      setGridKey((prevKey) => prevKey + 1);

      console.log("Guardado exitoso para la fila con id:", id);

      const body = {
        breakdownDate: updatedData[id]["BreakDown Date"],
        city: updatedData[id].City,
        driverName: updatedData[id]["Driver Name"],
        repairCategory: updatedData[id]["Repair Category"],
        repairNeeded: updatedData[id]["Repair Needed"],
        repairSubCategory: updatedData[id]["Repair SubCategory"],
        serviceProvider: updatedData[id]["Service Provider"],
        state: updatedData[id].State,
        status: updatedData[id].Status,
        sumbittedBy: updatedData[id]["Submitted by Dashboard"],
        total: updatedData[id].Total,
        trailer: updatedData[id]["Trailer #"],
        truck: updatedData[id]["Truck #"],
        rowIndex: updatedData[id].rowIndex,
        ETA: updatedData[id]["ETA"],
        onLocation: updatedData[id]["On-Location"],
        complete: updatedData[id]["Complete"]

      };

      console.log("body" + body)
      executePost({
        data: JSON.stringify(body),
      });
    }
  };
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  useEffect(() => {
    if (data) {
      const dataWithRowIndices = data.breakDowns.map((item, index) => ({
        ...item,
        rowIndex: index,
      }));
      setFilteredData(dataWithRowIndices);

      const categoryData = data.categories;
      setCategoriesAndSubcategories(categoryData);
      const initialEditStates = {};
      dataWithRowIndices.forEach((row, index) => {
        initialEditStates[index] = {
          "Breakdown Date": row["BreakDown Date"],
          "Repair Category": row["Repair Category"],
          "Repair SubCategory": row["Repair SubCategory"],
        };
      });
      setEditStates(initialEditStates);
    }
  }, [data]);



  if (loading || typeLoading) return <Spinner />;

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);

    setSelectedSubcategory("");
  };

  console.log(data);


  const columns = [
    {
      field: "BreakDown Date",
      headerName: "Breakdown Date",
      width: 200,
      editable: true,
      renderCell: (params) => {
        return <div>{dayjs(params.value).format("YYYY-MM-DD")}</div>;
      },
      renderEditCell: (params) => {
        const id = params.id;
        const value = dayjs(editStates[id]?.["BreakDown Date"] || params.value).format("YYYY-MM-DD");
        const isValidDate = (dateString) => {
          return !!dayjs(dateString, "YYYY-MM-DD", true).isValid();
        };
        const handleDateChange = (e) => {
          const newValue = e.target.value;

          if (isValidDate(newValue)) {
            const updatedEditStates = { ...editStates };
            updatedEditStates[id] = {
              ...updatedEditStates[id],
              "BreakDown Date": newValue,
            };
            setEditStates(updatedEditStates);
          }
        };

        return (
          <TextField
            type="date"
            value={value}
            onChange={handleDateChange}
            InputProps={{
              inputProps: {
                max: dayjs().format("YYYY-MM-DD"), // Optional: set max date if needed
              },
            }}
          />
        );
      },
    },
    {
      field: "Driver Name",
      headerName: "Driver Name",
      width: 200,
      editable: true,
      renderCell: (params) => {
        return <div>{params.value}</div>;
      },
      renderEditCell: (params) => {
        const id = params.id;
        return (
          <Select
            value={editStates[id]?.["Driver Name"] || params.value || ""}
            onChange={(e) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                "Driver Name": e.target.value,
              };
              setEditStates(updatedEditStates);
            }}
          >
            {data.drivers.map((name, index) => (
              <MenuItem key={index} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
    {
      field: "Truck #",
      headerName: "Truck #",
      width: 200,
      editable: true,
      renderEditCell: (params) => {
        const id = params.id;
        const value = editStates[id]?.["Truck #"] || params.value || "";

        return (
          <CustomTextFieldEditor
            id={id}
            value={value}
            onChange={(id, newValue) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                "Truck #": newValue,
              };
              setEditStates(updatedEditStates);
            }}
          />
        );
      },
    },
    {
      field: "Trailer #",
      headerName: "Trailer #",
      width: 200,
      editable: true,
      renderEditCell: (params) => {
        const id = params.id;
        const value = editStates[id]?.["Trailer #"] || params.value || "";

        return (
          <CustomTextFieldEditor
            id={id}
            value={value}
            onChange={(id, newValue) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                "Trailer #": newValue,
              };
              setEditStates(updatedEditStates);
            }}
          />
        );
      },
    },
    {
      field: "State",
      headerName: "State",
      width: 200,
      editable: true,
      renderCell: (params) => {
        return <div>{params.value}</div>;
      },
      renderEditCell: (params) => {
        const id = params.id;
        return (
          <Select
            value={editStates[id]?.["State"] || params.value || ""}
            onChange={(e) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                State: e.target.value,
              };
              setEditStates(updatedEditStates);
            }}
          >
            {data.states.map((name, index) => (
              <MenuItem key={index} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
    {
      field: "City",
      headerName: "City",
      width: 200,
      editable: true,
      renderEditCell: (params) => {
        const id = params.id;
        const value = editStates[id]?.["City"] || params.value || "";

        return (
          <CustomTextFieldEditor
            id={id}
            value={value}
            onChange={(id, newValue) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                City: newValue,
              };
              setEditStates(updatedEditStates);
            }}
          />
        );
      },
    },
    {
      field: "Service Provider",
      headerName: "Service Provider",
      width: 200,
      editable: true,
      renderCell: (params) => {
        return <div>{params.value}</div>;
      },
      renderEditCell: (params) => {
        const id = params.id;
        const selectedState = editStates[id]?.["State"];
    
        // Filtra los proveedores según el estado seleccionado
        const filteredProviders = data.providers.filter(
          provider => provider.State === selectedState
        );
    
        return (
          <Select
            value={editStates[id]?.["Service Provider"] || params.value || ""}
            onChange={(e) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                "Service Provider": e.target.value,
              };
              setEditStates(updatedEditStates);
            }}
          >
            {filteredProviders.map((provider, index) => (
              <MenuItem key={index} value={provider["Service Provider"]}>
                {provider["Service Provider"]}  {/* Aquí está la corrección */}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },    
    {
      field: "Repair Needed",
      headerName: "Repair Needed",
      width: 200,
      editable: true,
      renderEditCell: (params) => {
        const id = params.id;
        const value = editStates[id]?.["Repair Needed"] || params.value || "";

        return (
          <CustomTextFieldEditor
            id={id}
            value={value}
            onChange={(id, newValue) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                "Repair Needed": newValue,
              };
              setEditStates(updatedEditStates);
            }}
          />
        );
      },
    },
    {
      field: "Repair Category",
      headerName: "Repair Category",
      width: 200,
      editable: true,
      renderEditCell: (params) => {
        const id = params.id;
        return (
          <Select
            value={editStates[id]?.["Repair Category"] || params.value}
            onChange={(e) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                "Repair Category": e.target.value,
              };
              setEditStates(updatedEditStates);

              // Actualizar las subcategorías cuando cambia la categoría
              setSelectedSubcategory("");
            }}
          >
            {Object.keys(categoriesAndSubcategories).map((category, index) => (
              <MenuItem key={index} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
    {
      field: "Repair SubCategory",
      headerName: "Repair Subcategory",
      width: 200,
      editable: true,
      renderEditCell: (params) => {
        const id = params.id;
        const category = editStates[id]?.["Repair Category"] || selectedCategory;

        return (
          <Select
            value={editStates[id]?.["Repair SubCategory"] || selectedSubcategory}
            onChange={(e) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                "Repair SubCategory": e.target.value,
              };
              setEditStates(updatedEditStates);
            }}
          >
            {categoriesAndSubcategories[category]?.map((name, index) => (
              <MenuItem key={index} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
    {
      field: "Total",
      headerName: "Total",
      width: 200,
      editable: true,
      renderEditCell: (params) => {
        const id = params.id;
        const value = editStates[id]?.["Total"] || params.value || "";

        return (
          <CustomTextFieldEditor
            id={id}
            value={value}
            onChange={(id, newValue) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                Total: newValue,
              };
              setEditStates(updatedEditStates);
            }}
          />
        );
      },
    },
    {
      field: "Submitted by Dashboard",
      headerName: "Sumbitted By",
      width: 200,
      editable: true,
      renderCell: (params) => {
        return <div>{params.value}</div>;
      },
      renderEditCell: (params) => {
        const id = params.id;
        return (
          <Select
            value={editStates[id]?.["Submitted by Dashboard"] || params.value || ""}
            onChange={(e) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                "Submitted by Dashboard": e.target.value,
              };
              setEditStates(updatedEditStates);
            }}
          >
            {data.users.map((name, index) => (
              <MenuItem key={index} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
    {
      field: "ETA",
      headerName: "ETA",
      width: 200,
      editable: true,
      renderEditCell: (params) => {
        const id = params.id;
        const value = editStates[id]?.["ETA"] || params.value || "";

        return (
          <CustomTextFieldEditor
            id={id}
            value={value}
            onChange={(id, newValue) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                ETA: newValue, // Aquí se corrigió el error
              };
              setEditStates(updatedEditStates);
            }}
          />
        );
      },
    },
    {
      field: "On-Location",
      headerName: "On-Location",
      width: 200,
      editable: true,
      renderEditCell: (params) => {
        const id = params.id;
        const value = editStates[id]?.["On-Location"] || params.value || "";

        return (
          <Select
            value={value}
            onChange={(e) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                "On-Location": e.target.value,
              };
              setEditStates(updatedEditStates);
            }}
          >
            <MenuItem value="Arrived">Arrived</MenuItem>
          </Select>
        );
      },
    },
    {
      field: "Complete",
      headerName: "Complete",
      width: 200,
      editable: true,
      renderEditCell: (params) => {
        const id = params.id;
        const value = editStates[id]?.["Complete"] || params.value || "";

        return (
          <Select
            value={value}
            onChange={(e) => {
              const updatedEditStates = { ...editStates };
              updatedEditStates[id] = {
                ...updatedEditStates[id],
                Complete: e.target.value,
              };
              setEditStates(updatedEditStates);
            }}
          >
            <MenuItem value="Fixed">Fixed</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Complete">Complete</MenuItem>
          </Select>
        );
      },
    }
    ,
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(id)}
          />,
        ];
      },
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="my-4 flex justify-between px-2">
        <div className="flex"></div>
        <div className="m-1">Total: {filteredData.length}</div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <DataGrid
                key={gridKey}
                rows={filteredData}
                getRowId={(row) => row.rowIndex}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
