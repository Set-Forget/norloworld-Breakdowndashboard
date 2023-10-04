import { useState, useEffect } from "react";
import useAxios from "axios-hooks"; // Asegúrate de que estés importando useAxios desde axios-hooks
import ComboBox from "./ComboBox";
import Spinner from "./Spinner";
import { DataGrid } from '@mui/x-data-grid';
import { GridActionsCellItem, GridRowModes } from "@mui/x-data-grid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CustomTextFieldEditor from "./customTextFieldEditor";


const endPoint =
    "https://script.google.com/macros/s/AKfycbx5AAww6De17U5lkbTr2xCV8h6eXps0BWoZR5vb_cZyBj9JmunsuP9yAESMZm6rHJDSHg/exec";

export default function providers() {
    const [{ data, loading, error }] = useAxios(
        endPoint + "?route=getBreakdowns"
    );
    const [
        { data: postData, loading: postLoading, error: postError },
        executePost,
    ] = useAxios(
        {
            url: endPoint + "?route=editProviders",
            method: "POST",
        },
        { manual: true }
    );


    const [providers, setproviders] = useState([]);
    const [warning, setWarning] = useState(false);
    const [rowModesModel, setRowModesModel] = useState({});
    const [editedRow, setEditedRow] = useState({});
    const [editStates, setEditStates] = useState({});


    useEffect(() => {
        if (data && data.providers) {
            setproviders(data.providers);
        }
    }, [data]);

    const columns = [
        { field: 'Service Provider', headerName: 'Provider', width: 200 },
        { field: 'State', headerName: 'State', width: 200 },
        { field: 'City', headerName: 'City', width: 200 },
        {
            field: "Phone Number",
            headerName: "Phone Number",
            width: 200,
            editable: true,
            renderEditCell: (params) => {
                const id = params.id;
                const value = editStates[id]?.["Phone Number"] || params.value || "";

                return (
                    <CustomTextFieldEditor
                        id={id}
                        value={value}
                        onChange={(id, newValue) => {
                            const updatedEditStates = { ...editStates };
                            updatedEditStates[id] = {
                                ...updatedEditStates[id],
                                "Phone Number": newValue,
                            };
                            setEditStates(updatedEditStates);
                        }}
                    />
                );
            },
        },
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


    const handleEditClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleCellChange = (params) => {
        const { id, field, props } = params;
        const value = props.value;
        setEditStates((prevEditStates) => ({
            ...prevEditStates,
            [id]: {
                ...prevEditStates[id],
                [field]: value
            }
        }));
    };


    const handleSaveClick = (id) => () => {
        console.log(editStates);

        const baseRow = providers.find((provider) => provider.rowIndex === id);
        const editsForThisRow = editStates[id] || {};
        const updatedRow = { ...baseRow, ...editsForThisRow };

        if (updatedRow) {
            const body = {
                editedData: updatedRow,
            };
            console.log(body)
            executePost({
                data: JSON.stringify(body),
            })
                .then((response) => {
                    console.log(response)
                    if (response.status === 200) {
                        toast.success("Phone edited successfully");

                        // Actualizar el estado local 'providers' con los datos editados
                        const updatedProviders = providers.map(provider =>
                            provider.rowIndex === id ? updatedRow : provider
                        );
                        setproviders(updatedProviders);

                    } else {
                        toast.error("Error");
                    }
                })
                .catch(() => {
                    toast.error("Error");
                });

            setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
        }
    };




    if (loading) return <Spinner />;
    if (error) return <div>Error al obtener los datos: {error.message}</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            {warning && (
                <p className="text-sm text-red-600 mt-4 mb-4" id="email-error">
                    Complete the required fields *
                </p>
            )}
            <ToastContainer />
            <div style={{ height: 400, width: '80%', display: 'flex', justifyContent: 'center' }}>
                <DataGrid
                    rows={providers}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10]}
                    getRowId={(row) => row.rowIndex}
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
                    onEditCellChangeCommitted={(params) => handleCellChange(params)}
                />
            </div>
        </div>
    );
}